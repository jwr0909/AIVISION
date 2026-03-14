import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { initBoardTables, query } from './db'
import postsRouter from './routes/posts'
import chatRouter from './routes/chat'
import feedRouter from './routes/feed'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '5000', 10)

app.use(cors())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// 업로드 디렉토리 (향후 파일 저장 시 사용)
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 업로드 파일 정적 서빙
app.use('/api/files', express.static(uploadDir))

// 헬스체크 엔드포인트
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 게시판 API 라우트
app.use('/api/posts', postsRouter)

// 채팅 API 라우트
app.use('/api/chat', chatRouter)

// 피드 게시판 API 라우트
app.use('/api/feed', feedRouter)

// ─── 스마트팩토리 API ───

// 샘플 데이터 생성
app.post('/api/seed', async (_req, res) => {
  try {
    // 품목 기초 데이터
    await query(`
      INSERT INTO item_mst (item_cd, item_name, std, unit_cd)
      VALUES
        ('PART-001', '자동차 엔진 피스톤 A', 'Aluminum Alloy', 'EA'),
        ('PART-002', '브레이크 패드 V2', 'Ceramic Composite', 'EA'),
        ('PART-003', '전조등 하우징', 'Polycarbonate', 'EA')
      ON CONFLICT (item_cd) DO NOTHING
    `)

    // 사원 기초 데이터
    await query(`
      INSERT INTO emp_mst (emp_id, emp_name, dept_name)
      VALUES
        ('EMP-001', '김철수', '생산1팀'),
        ('EMP-002', '이영희', '품질관리팀')
      ON CONFLICT (emp_id) DO NOTHING
    `)

    // 작업 실적 생성
    const perfRows = await query(`
      INSERT INTO work_performances (work_order_no, item_cd, emp_id, plan_qty, prod_qty, bad_qty, status)
      VALUES ('WO-20260314-SEED', 'PART-001', 'EMP-001', 1000, 0, 0, 'RUNNING')
      RETURNING id
    `)
    const perfId = perfRows[0].id

    // AI 비전 로그 50개 생성
    const defectTypes = ['Normal', 'Crack', 'Scratch', 'Dent', 'Stain']
    const logValues: string[] = []
    const logParams: any[] = []
    let paramIdx = 1

    for (let i = 0; i < 50; i++) {
      const isDefect = Math.random() < 0.15
      const defectType = isDefect ? defectTypes[Math.floor(Math.random() * 4) + 1] : null
      const confidence = (Math.random() * 14.9 + 85).toFixed(2)
      const imageUrl = isDefect
        ? 'https://placehold.co/600x400/ff0000/white?text=Defect+Detected'
        : 'https://placehold.co/600x400/00ff00/white?text=OK'
      const scanTime = new Date(Date.now() - i * 60000)

      logValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`)
      logParams.push(
        perfId,
        `BC-${Date.now()}-${i}`,
        scanTime,
        isDefect ? 'NG' : 'OK',
        defectType,
        confidence,
        imageUrl,
      )
    }

    await query(
      `INSERT INTO ai_vision_logs (work_performance_id, barcode, scan_time, result, defect_type, confidence_score, image_url)
       VALUES ${logValues.join(', ')}`,
      logParams
    )

    res.json({ message: '샘플 데이터 생성 완료', performanceId: perfId })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ message: '샘플 데이터 생성 실패', error: String(error) })
  }
})

// AI 비전 로그 조회
app.get('/api/vision/logs', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT
        l.id,
        l.scan_time AS time,
        l.barcode,
        l.result,
        l.defect_type AS "defectType",
        l.confidence_score AS confidence,
        l.image_url AS image,
        COALESCE(i.item_name, '알 수 없음') AS "itemName"
      FROM ai_vision_logs l
      LEFT JOIN work_performances p ON l.work_performance_id = p.id
      LEFT JOIN item_mst i ON p.item_cd = i.item_cd
      ORDER BY l.scan_time DESC
      LIMIT 50
    `)
    res.json(rows)
  } catch (error) {
    console.error('vision/logs error:', error)
    res.status(500).json({ message: '로그 조회 실패' })
  }
})

// 대시보드 통계 조회
app.get('/api/vision/stats', async (_req, res) => {
  try {
    const [totalRow] = await query(`SELECT COUNT(*) AS count FROM ai_vision_logs`)
    const [ngRow] = await query(`SELECT COUNT(*) AS count FROM ai_vision_logs WHERE result = 'NG'`)
    const distribution = await query(`
      SELECT defect_type AS type, COUNT(*) AS count
      FROM ai_vision_logs
      WHERE result = 'NG' AND defect_type IS NOT NULL
      GROUP BY defect_type
      ORDER BY count DESC
    `)
    const trend = await query(`
      SELECT scan_time AS time, result
      FROM ai_vision_logs
      ORDER BY scan_time DESC
      LIMIT 20
    `)
    const total = Number(totalRow.count)
    const ng = Number(ngRow.count)
    res.json({
      total,
      ng,
      ok: total - ng,
      distribution: distribution.map(d => ({ type: d.type, count: Number(d.count) })),
      trend,
    })
  } catch (error) {
    console.error('vision/stats error:', error)
    res.status(500).json({ message: '통계 조회 실패' })
  }
})

// 작업실적 저장
app.post('/api/work-result', async (req, res) => {
  try {
    const { workOrderNo, prcCd, prcName, workDate, empId, details } = req.body
    if (!details || details.length === 0) {
      return res.status(400).json({ message: '상세내역이 없습니다. 품목을 추가해주세요.' })
    }
    const totalQty = (details as any[]).reduce((s: number, d: any) => s + (Number(d.prcRealQty) || 0), 0)
    const totalBadQty = (details as any[]).reduce((s: number, d: any) => s + (Number(d.badQty) || 0), 0)
    const [saved] = await query(
      `INSERT INTO work_result_entries (work_order_no, prc_cd, prc_name, work_date, emp_id, total_qty, total_bad_qty, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, work_order_no AS "workOrderNo", prc_cd AS "prcCd", prc_name AS "prcName",
                 work_date AS "workDate", emp_id AS "empId", total_qty AS "totalQty",
                 total_bad_qty AS "totalBadQty", details, created_at AS "createdAt"`,
      [workOrderNo || `WO-${Date.now()}`, prcCd || '', prcName || '', workDate || new Date().toISOString().split('T')[0], empId || '', totalQty, totalBadQty, JSON.stringify(details)]
    )
    res.json({ success: true, id: saved.id, data: saved })
  } catch (error) {
    console.error('work-result save error:', error)
    res.status(500).json({ message: '저장에 실패했습니다.', error: String(error) })
  }
})

// 작업실적 목록 조회
app.get('/api/work-result', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT id, work_order_no AS "workOrderNo", prc_cd AS "prcCd", prc_name AS "prcName",
              work_date AS "workDate", emp_id AS "empId", total_qty AS "totalQty",
              total_bad_qty AS "totalBadQty", details, created_at AS "createdAt"
       FROM work_result_entries
       ORDER BY created_at DESC
       LIMIT 100`
    )
    res.json(rows)
  } catch (error) {
    console.error('work-result list error:', error)
    res.status(500).json({ message: '조회에 실패했습니다.' })
  }
})

// 작업실적 수정
app.put('/api/work-result/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { workOrderNo, prcCd, prcName, workDate, empId, details } = req.body
    const totalQty = (details || []).reduce((s: number, d: any) => s + (Number(d.prcRealQty) || 0), 0)
    const totalBadQty = (details || []).reduce((s: number, d: any) => s + (Number(d.badQty) || 0), 0)
    const [updated] = await query(
      `UPDATE work_result_entries
       SET work_order_no=$1, prc_cd=$2, prc_name=$3, work_date=$4, emp_id=$5,
           total_qty=$6, total_bad_qty=$7, details=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING id, work_order_no AS "workOrderNo", prc_cd AS "prcCd", prc_name AS "prcName",
                 work_date AS "workDate", emp_id AS "empId", total_qty AS "totalQty",
                 total_bad_qty AS "totalBadQty", details`,
      [workOrderNo, prcCd, prcName, workDate, empId, totalQty, totalBadQty, JSON.stringify(details || []), id]
    )
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('work-result update error:', error)
    res.status(500).json({ message: '수정에 실패했습니다.' })
  }
})

// 작업실적 삭제
app.delete('/api/work-result/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await query('DELETE FROM work_result_entries WHERE id=$1', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('work-result delete error:', error)
    res.status(500).json({ message: '삭제에 실패했습니다.' })
  }
})

// DB 초기화 (테이블 생성)
initBoardTables().catch((err) => {
  console.error('⚠️ DB 초기화 실패 (서버는 계속 실행됩니다):', err)
})

// 프로덕션: 빌드된 프론트엔드 정적 파일 서빙
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI 한글 에디터 서버가 포트 ${PORT}에서 실행 중입니다.`)
})
