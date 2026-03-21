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
const PORT = parseInt(process.env.PORT || '5001', 10)

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

// ─── AI 비전 검사 설정 API (파일 저장) ───
const visionSettingsFile = path.join(__dirname, '..', 'vision_settings.json')

app.get('/api/vision/settings', (req, res) => {
  try {
    if (fs.existsSync(visionSettingsFile)) {
      const data = fs.readFileSync(visionSettingsFile, 'utf-8')
      res.json(JSON.parse(data))
    } else {
      res.json({ config: null, model: null })
    }
  } catch (e) {
    res.status(500).json({ message: '설정 불러오기 실패' })
  }
})

app.post('/api/vision/settings', (req, res) => {
  try {
    const { config, model } = req.body
    fs.writeFileSync(visionSettingsFile, JSON.stringify({ config, model }))
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: '설정 저장 실패' })
  }
})

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

    // 검사요청유형(불량유형) 기초 데이터 29건
    await query(`
      INSERT INTO defect_type_mst (grp_cd, grp_name, defect_cd, defect_name, sort_no) VALUES
        ('L01','외주불량','007','찍힘불량',1),
        ('L01','외주불량','O01','가공불량',2),
        ('L01','외주불량','O02','단조불량',3),
        ('L01','외주불량','O03','크랙불량',4),
        ('L01','외주불량','O04','시편폐기',5),
        ('L01','외주불량','O05','고주파 크랙',6),
        ('L01','외주불량','O06','열처리 불량',7),
        ('L01','외주불량','O08','절단불량',8),
        ('L01','외주불량','O09','소재크랙',9),
        ('L01','외주불량','O10','소재불량',10),
        ('L01','외주불량','O11','소재흑피',11),
        ('L01','외주불량','O12','세팅불량',12),
        ('L02','가공불량','P01','가공불량(셋팅)',13),
        ('L02','가공불량','P02','가공불량(양면삭)',14),
        ('L02','가공불량','P03','가공불량(보링)',15),
        ('L02','가공불량','P04','가공불량(드릴)',16),
        ('L02','가공불량','P05','가공불량(좌삭)',17),
        ('L02','가공불량','P06','조립불량',18),
        ('L02','가공불량','P07','외관불량(형상)',19),
        ('L02','가공불량','P08','연마불량',20),
        ('L02','가공불량','P09','찍힘불량',21),
        ('L02','가공불량','P10','버핑불량',22),
        ('L02','가공불량','P11','가공불량(와이어커팅)',23),
        ('L03','열처리불량','H01','고주파 시편',24),
        ('L03','열처리불량','H02','고주파 크랙',25),
        ('L03','열처리불량','H03','열처리 셋팅불량',26),
        ('L03','열처리불량','H04','소재크랙',27),
        ('L03','열처리불량','H05','스프레이켄칭크랙',28),
        ('L05','소재부족','A01','소재부족',29)
      ON CONFLICT (grp_cd, defect_cd) DO NOTHING
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

// ─── 품목 마스터 API ───

// 품목 목록 조회
app.get('/api/item-master', async (req, res) => {
  try {
    const { item_cls, keyword, std, use_yn } = req.query
    let sql = `SELECT * FROM item_mst WHERE 1=1`
    const params: any[] = []
    let i = 1
    if (item_cls) { sql += ` AND item_cls=$${i++}`; params.push(item_cls) }
    if (keyword)  { sql += ` AND (item_cd ILIKE $${i} OR item_name ILIKE $${i})`; params.push(`%${keyword}%`); i++ }
    if (std)      { sql += ` AND std ILIKE $${i++}`; params.push(`%${std}%`) }
    if (use_yn === 'Y') { sql += ` AND use_yn='Y'` }
    sql += ` ORDER BY created_at DESC`
    const rows = await query(sql, params)
    res.json(rows)
  } catch (e) {
    console.error('item-master list error:', e)
    res.status(500).json({ message: '조회 실패' })
  }
})

// 품목 단건 조회
app.get('/api/item-master/:item_cd', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM item_mst WHERE item_cd=$1', [req.params.item_cd])
    if (!rows.length) return res.status(404).json({ message: '없음' })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ message: '조회 실패' })
  }
})

// 품목 등록
app.post('/api/item-master', async (req, res) => {
  try {
    const d = req.body
    const now = new Date().toISOString().slice(0,10)
    await query(`
      INSERT INTO item_mst (
        item_cd, item_name, std, use_yn, bom_yn, item_cls, acct_cd, acct_name,
        drawing_no, item_name_eng, item_grp, base_unit, conv_unit, base_ratio, conv_ratio,
        bom_unit, bom_base_ratio, bom_ratio, wh_cd, wh_name, prc_cd, prc_name,
        eqp_cd, eqp_name, prod_lt, div_cls, prod_plan_yn, in_out_cls, supply_cls,
        out_vendor_cd, vendor_name, opt_stock, safe_stock, init_qty, init_amt,
        std_cost, work_date, work_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38
      )`,
      [d.item_cd, d.item_name, d.std, d.use_yn??'Y', d.bom_yn??'N', d.item_cls??'제품',
       d.acct_cd, d.acct_name, d.drawing_no, d.item_name_eng, d.item_grp,
       d.base_unit, d.conv_unit, d.base_ratio??1, d.conv_ratio??1,
       d.bom_unit, d.bom_base_ratio??1, d.bom_ratio??1,
       d.wh_cd, d.wh_name, d.prc_cd, d.prc_name, d.eqp_cd, d.eqp_name,
       d.prod_lt??0, d.div_cls, d.prod_plan_yn??'N', d.in_out_cls??'사내',
       d.supply_cls, d.out_vendor_cd, d.vendor_name,
       d.opt_stock??0, d.safe_stock??0, d.init_qty??0, d.init_amt??0,
       d.std_cost??0, now, 'admin']
    )
    res.json({ success: true })
  } catch (e: any) {
    console.error('item-master create error:', e)
    res.status(500).json({ message: e.detail ?? '등록 실패' })
  }
})

// 품목 수정
app.put('/api/item-master/:item_cd', async (req, res) => {
  try {
    const d = req.body
    const now = new Date().toISOString().slice(0,10)
    await query(`
      UPDATE item_mst SET
        item_name=$1, std=$2, use_yn=$3, bom_yn=$4, item_cls=$5, acct_cd=$6, acct_name=$7,
        drawing_no=$8, item_name_eng=$9, item_grp=$10, base_unit=$11, conv_unit=$12,
        base_ratio=$13, conv_ratio=$14, bom_unit=$15, bom_base_ratio=$16, bom_ratio=$17,
        wh_cd=$18, wh_name=$19, prc_cd=$20, prc_name=$21, eqp_cd=$22, eqp_name=$23,
        prod_lt=$24, div_cls=$25, prod_plan_yn=$26, in_out_cls=$27, supply_cls=$28,
        out_vendor_cd=$29, vendor_name=$30, opt_stock=$31, safe_stock=$32,
        init_qty=$33, init_amt=$34, std_cost=$35, work_date=$36, work_id=$37, updated_at=NOW()
      WHERE item_cd=$38`,
      [d.item_name, d.std, d.use_yn??'Y', d.bom_yn??'N', d.item_cls??'제품',
       d.acct_cd, d.acct_name, d.drawing_no, d.item_name_eng, d.item_grp,
       d.base_unit, d.conv_unit, d.base_ratio??1, d.conv_ratio??1,
       d.bom_unit, d.bom_base_ratio??1, d.bom_ratio??1,
       d.wh_cd, d.wh_name, d.prc_cd, d.prc_name, d.eqp_cd, d.eqp_name,
       d.prod_lt??0, d.div_cls, d.prod_plan_yn??'N', d.in_out_cls??'사내',
       d.supply_cls, d.out_vendor_cd, d.vendor_name,
       d.opt_stock??0, d.safe_stock??0, d.init_qty??0, d.init_amt??0,
       d.std_cost??0, now, 'admin', req.params.item_cd]
    )
    res.json({ success: true })
  } catch (e) {
    console.error('item-master update error:', e)
    res.status(500).json({ message: '수정 실패' })
  }
})

// 품목 삭제
app.delete('/api/item-master/:item_cd', async (req, res) => {
  try {
    await query('DELETE FROM item_mst WHERE item_cd=$1', [req.params.item_cd])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: '삭제 실패' })
  }
})

// ─── 검사요청등록 API ───

// 목록 조회
app.get('/api/inspection-request', async (req, res) => {
  try {
    const { req_date, grp_cd } = req.query
    let sql = `SELECT * FROM inspection_requests WHERE 1=1`
    const params: any[] = []
    let i = 1
    if (req_date) { sql += ` AND req_date=$${i++}`; params.push(req_date) }
    if (grp_cd) { sql += ` AND defect_grp_cd=$${i++}`; params.push(grp_cd) }
    sql += ` ORDER BY req_date DESC, id DESC`
    res.json(await query(sql, params))
  } catch (e) { res.status(500).json({ message: '조회 실패' }) }
})

// 등록
app.post('/api/inspection-request', async (req, res) => {
  try {
    const d = req.body
    await query(
      `INSERT INTO inspection_requests (req_date, req_no, defect_grp_cd, manager_id, manager_name, dept_cd, dept_name, remark, items, work_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [d.req_date, d.req_no, d.defect_grp_cd, d.manager_id, d.manager_name, d.dept_cd, d.dept_name, d.remark, JSON.stringify(d.items || []), 'AI_BOT']
    )
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ message: e.detail ?? '등록 실패' }) }
})

// 수정
app.put('/api/inspection-request/:id', async (req, res) => {
  try {
    const d = req.body
    await query(
      `UPDATE inspection_requests SET req_date=$1, defect_grp_cd=$2, manager_id=$3, manager_name=$4,
       dept_cd=$5, dept_name=$6, remark=$7, items=$8, work_date=NOW() WHERE id=$9`,
      [d.req_date, d.defect_grp_cd, d.manager_id, d.manager_name, d.dept_cd, d.dept_name, d.remark, JSON.stringify(d.items || []), req.params.id]
    )
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ message: e.detail ?? '수정 실패' }) }
})

// 삭제
app.delete('/api/inspection-request/:id', async (req, res) => {
  try {
    await query('DELETE FROM inspection_requests WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ message: '삭제 실패' }) }
})

// ─── 검사요청유형(불량유형) API ───

// 목록 조회
app.get('/api/defect-type', async (req, res) => {
  try {
    const { grp_cd, keyword } = req.query
    let sql = `SELECT * FROM defect_type_mst WHERE 1=1`
    const params: any[] = []
    let i = 1
    if (grp_cd)  { sql += ` AND grp_cd=$${i++}`; params.push(grp_cd) }
    if (keyword) { sql += ` AND (defect_cd ILIKE $${i} OR defect_name ILIKE $${i})`; params.push(`%${keyword}%`); i++ }
    sql += ` ORDER BY sort_no, grp_cd, defect_cd`
    res.json(await query(sql, params))
  } catch (e) { res.status(500).json({ message: '조회 실패' }) }
})

// 그룹 목록
app.get('/api/defect-type/groups', async (_req, res) => {
  try {
    const rows = await query(`SELECT DISTINCT grp_cd, grp_name FROM defect_type_mst ORDER BY grp_cd`)
    res.json(rows)
  } catch (e) { res.status(500).json({ message: '조회 실패' }) }
})

// 등록
app.post('/api/defect-type', async (req, res) => {
  try {
    const d = req.body
    const now = new Date().toISOString().slice(0,10)
    const maxSort = await query(`SELECT COALESCE(MAX(sort_no),0)+1 AS next FROM defect_type_mst`)
    await query(
      `INSERT INTO defect_type_mst (grp_cd, grp_name, defect_cd, defect_name, remark, use_yn, sort_no, work_date, work_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [d.grp_cd, d.grp_name, d.defect_cd, d.defect_name, d.remark??null, d.use_yn??'Y', maxSort[0].next, now, 'admin']
    )
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ message: e.detail ?? '등록 실패' }) }
})

// 수정
app.put('/api/defect-type/:id', async (req, res) => {
  try {
    const d = req.body
    const now = new Date().toISOString().slice(0,10)
    await query(
      `UPDATE defect_type_mst SET grp_cd=$1, grp_name=$2, defect_cd=$3, defect_name=$4,
       remark=$5, use_yn=$6, work_date=$7, work_id=$8, updated_at=NOW() WHERE id=$9`,
      [d.grp_cd, d.grp_name, d.defect_cd, d.defect_name, d.remark??null, d.use_yn??'Y', now, 'admin', req.params.id]
    )
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ message: e.detail ?? '수정 실패' }) }
})

// 삭제
app.delete('/api/defect-type/:id', async (req, res) => {
  try {
    await query('DELETE FROM defect_type_mst WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ message: '삭제 실패' }) }
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
