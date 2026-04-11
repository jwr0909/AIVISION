import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const { Pool } = pg

// DATABASE_URL 환경 변수로 PostgreSQL 연결
let pool: pg.Pool

if (process.env.DATABASE_URL) {
  console.log('🔗 DATABASE_URL 사용하여 연결')
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
} else {
  console.log('🔗 개별 환경 변수 사용하여 연결')
  pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'aihanguledit',
    password: process.env.PGPASSWORD || '',
    port: parseInt(process.env.PGPORT || '5432'),
    ssl: process.env.REPLIT_DEPLOYMENT === '1' ? { rejectUnauthorized: false } : undefined,
  })
}

// ⚠️ 추가: 예상치 못한 DB 연결 끊김으로 인한 서버 크래시 방지
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
})

// SQL 쿼리 실행 함수
export async function query(text: string, params: any[] = []) {
  try {
    const res = await pool.query(text, params)
    return res.rows
  } catch (error) {
    console.error('❌ 쿼리 실행 오류:', error)
    throw error
  }
}

// 게시판 테이블 초기화
export async function initBoardTables() {
  const client = await pool.connect()
  try {
    console.log('🔄 게시판 테이블 초기화 시작...')

    // posts 테이블 (기존 게시판 — 호환 유지)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('📦 posts 테이블 준비 완료')

    // post_comments 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('📦 post_comments 테이블 준비 완료')

    // ─── 채팅 메시지 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL DEFAULT 'general',
        author_name VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('📦 chat_messages 테이블 준비 완료')

    // ─── 피드 게시판 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_posts (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        media_type VARCHAR(20),
        media_url TEXT,
        media_urls TEXT[],
        thumbnail_url TEXT,
        youtube_url TEXT,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        report_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('📦 feed_posts 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES feed_posts(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES feed_comments(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('📦 feed_comments 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_votes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES feed_posts(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        vote_type VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, author_name)
      );
    `)
    console.log('📦 feed_votes 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_comment_votes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER REFERENCES feed_comments(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        vote_type VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, author_name)
      );
    `)
    console.log('📦 feed_comment_votes 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_reports (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES feed_posts(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, author_name)
      );
    `)
    console.log('📦 feed_reports 테이블 준비 완료')

    // ─── 피드 이모지 리액션 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_reactions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES feed_posts(id) ON DELETE CASCADE,
        author_name VARCHAR(50) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, author_name, emoji)
      );
    `)
    console.log('📦 feed_reactions 테이블 준비 완료')

    // ─── 스마트팩토리 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS item_mst (
        item_cd       VARCHAR(40) PRIMARY KEY,
        item_name     VARCHAR(100) NOT NULL,
        std           VARCHAR(100),
        unit_cd       VARCHAR(5),
        use_yn        CHAR(1) DEFAULT 'Y',
        bom_yn        CHAR(1) DEFAULT 'N',
        item_cls      VARCHAR(20) DEFAULT '제품',
        acct_cd       VARCHAR(10),
        acct_name     VARCHAR(40),
        drawing_no    VARCHAR(60),
        item_name_eng VARCHAR(100),
        item_grp      VARCHAR(40),
        base_unit     VARCHAR(10),
        conv_unit     VARCHAR(10),
        base_ratio    NUMERIC(12,4) DEFAULT 1,
        conv_ratio    NUMERIC(12,4) DEFAULT 1,
        bom_unit      VARCHAR(10),
        bom_base_ratio NUMERIC(12,4) DEFAULT 1,
        bom_ratio     NUMERIC(12,4) DEFAULT 1,
        wh_cd         VARCHAR(20),
        wh_name       VARCHAR(60),
        prc_cd        VARCHAR(20),
        prc_name      VARCHAR(60),
        eqp_cd        VARCHAR(20),
        eqp_name      VARCHAR(60),
        prod_lt       INTEGER DEFAULT 0,
        div_cls       VARCHAR(20),
        prod_plan_yn  CHAR(1) DEFAULT 'N',
        in_out_cls    VARCHAR(10) DEFAULT '사내',
        supply_cls    VARCHAR(20),
        out_vendor_cd VARCHAR(20),
        vendor_name   VARCHAR(60),
        opt_stock     NUMERIC(14,2) DEFAULT 0,
        safe_stock    NUMERIC(14,2) DEFAULT 0,
        init_qty      NUMERIC(14,2) DEFAULT 0,
        init_amt      NUMERIC(16,2) DEFAULT 0,
        std_cost      NUMERIC(16,2) DEFAULT 0,
        work_date     VARCHAR(10),
        work_id       VARCHAR(20),
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );
    `)
    // 기존 테이블에 누락 컬럼 추가 (IF NOT EXISTS)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS use_yn CHAR(1) DEFAULT 'Y'`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS bom_yn CHAR(1) DEFAULT 'N'`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS item_cls VARCHAR(20) DEFAULT '제품'`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS acct_cd VARCHAR(10)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS acct_name VARCHAR(40)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS drawing_no VARCHAR(60)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS item_name_eng VARCHAR(100)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS item_grp VARCHAR(40)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS base_unit VARCHAR(10)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS conv_unit VARCHAR(10)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS base_ratio NUMERIC(12,4) DEFAULT 1`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS conv_ratio NUMERIC(12,4) DEFAULT 1`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS bom_unit VARCHAR(10)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS bom_base_ratio NUMERIC(12,4) DEFAULT 1`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS bom_ratio NUMERIC(12,4) DEFAULT 1`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS wh_cd VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS wh_name VARCHAR(60)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS prc_cd VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS prc_name VARCHAR(60)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS eqp_cd VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS eqp_name VARCHAR(60)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS prod_lt INTEGER DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS div_cls VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS prod_plan_yn CHAR(1) DEFAULT 'N'`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS in_out_cls VARCHAR(10) DEFAULT '사내'`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS supply_cls VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS out_vendor_cd VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(60)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS opt_stock NUMERIC(14,2) DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS safe_stock NUMERIC(14,2) DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS init_qty NUMERIC(14,2) DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS init_amt NUMERIC(16,2) DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS std_cost NUMERIC(16,2) DEFAULT 0`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS work_date VARCHAR(10)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS work_id VARCHAR(20)`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`)
    await client.query(`ALTER TABLE item_mst ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`)
    console.log('📦 item_mst 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS emp_mst (
        emp_id VARCHAR(10) PRIMARY KEY,
        emp_name VARCHAR(20) NOT NULL,
        dept_name VARCHAR(30)
      );
    `)
    console.log('📦 emp_mst 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS work_performances (
        id SERIAL PRIMARY KEY,
        work_order_no VARCHAR(20) NOT NULL,
        item_cd VARCHAR(40) REFERENCES item_mst(item_cd),
        emp_id VARCHAR(10) REFERENCES emp_mst(emp_id),
        work_date TIMESTAMP DEFAULT NOW(),
        plan_qty INTEGER DEFAULT 0,
        prod_qty INTEGER DEFAULT 0,
        bad_qty INTEGER DEFAULT 0,
        status VARCHAR(10) DEFAULT 'RUNNING'
      );
    `)
    console.log('📦 work_performances 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_vision_logs (
        id SERIAL PRIMARY KEY,
        work_performance_id INTEGER REFERENCES work_performances(id),
        barcode VARCHAR(50),
        scan_time TIMESTAMP DEFAULT NOW(),
        result VARCHAR(2) NOT NULL,
        defect_type VARCHAR(20),
        confidence_score DECIMAL(5,2),
        image_url TEXT,
        overlay_url TEXT,
        camera_ip VARCHAR(20),
        processing_time_ms INTEGER
      );
    `)
    console.log('📦 ai_vision_logs 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS work_result_entries (
        id SERIAL PRIMARY KEY,
        work_order_no VARCHAR(50),
        prc_cd VARCHAR(20),
        prc_name VARCHAR(100),
        work_date VARCHAR(10),
        emp_id VARCHAR(30),
        total_qty INTEGER DEFAULT 0,
        total_bad_qty INTEGER DEFAULT 0,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('📦 work_result_entries 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_requests (
        id SERIAL PRIMARY KEY,
        req_date VARCHAR(10) NOT NULL,
        req_no VARCHAR(20) NOT NULL UNIQUE,
        defect_grp_cd VARCHAR(20),
        manager_id VARCHAR(50),
        manager_name VARCHAR(50),
        dept_cd VARCHAR(50),
        dept_name VARCHAR(50),
        remark TEXT,
        items JSONB,
        work_date TIMESTAMP DEFAULT NOW(),
        work_id VARCHAR(50) DEFAULT 'SYSTEM'
      );
    `)
    // add column if not exists for already created table
    await client.query(`ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS items JSONB;`)
    console.log('📦 inspection_requests 테이블 준비 완료')

    // ─── 검사요청유형 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS defect_type_mst (
        id          SERIAL PRIMARY KEY,
        grp_cd      VARCHAR(10) NOT NULL,
        grp_name    VARCHAR(40) NOT NULL,
        defect_cd   VARCHAR(10) NOT NULL,
        defect_name VARCHAR(60) NOT NULL,
        remark      VARCHAR(100),
        use_yn      CHAR(1) DEFAULT 'Y',
        sort_no     INTEGER DEFAULT 0,
        work_date   VARCHAR(10),
        work_id     VARCHAR(20),
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE(grp_cd, defect_cd)
      );
    `)
    // 시드 데이터 삽입 (없을 때만)
    await client.query(`
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
      ON CONFLICT (grp_cd, defect_cd) DO NOTHING;
    `)
    console.log('📦 defect_type_mst 테이블 준비 완료')

    // ─── 온톨로지(그래프 DB) 데이터 저장용 테이블 ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS ontology_nodes (
        id SERIAL PRIMARY KEY,
        node_id VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(200) NOT NULL,
        type VARCHAR(50) NOT NULL,
        properties JSONB,
        source_table VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('📦 ontology_nodes 테이블 준비 완료')

    await client.query(`
      CREATE TABLE IF NOT EXISTS ontology_edges (
        id SERIAL PRIMARY KEY,
        source_id VARCHAR(100) REFERENCES ontology_nodes(node_id) ON DELETE CASCADE,
        target_id VARCHAR(100) REFERENCES ontology_nodes(node_id) ON DELETE CASCADE,
        relationship VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(source_id, target_id, relationship)
      );
    `)
    console.log('📦 ontology_edges 테이블 준비 완료')

    // 인덱스 생성
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created ON chat_messages(channel, created_at ASC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_votes_post ON feed_votes(post_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_reactions_post ON feed_reactions(post_id)`)

    // 피드 댓글 수 자동 업데이트 트리거
    await client.query(`
      CREATE OR REPLACE FUNCTION update_feed_comments_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE feed_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `)
    await client.query(`DROP TRIGGER IF EXISTS trigger_feed_comments_count ON feed_comments;`)
    await client.query(`
      CREATE TRIGGER trigger_feed_comments_count
        AFTER INSERT OR DELETE ON feed_comments
        FOR EACH ROW EXECUTE FUNCTION update_feed_comments_count();
    `)

    // 댓글 수 자동 업데이트 트리거
    await client.query(`
      CREATE OR REPLACE FUNCTION update_post_comments_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await client.query(`DROP TRIGGER IF EXISTS trigger_comments_count ON post_comments`)
    await client.query(`
      CREATE TRIGGER trigger_comments_count
        AFTER INSERT OR DELETE ON post_comments
        FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
    `)

    console.log('🎉 테이블 초기화 완료!')
  } catch (error) {
    console.error('❌ 테이블 초기화 오류:', error)
  } finally {
    client.release()
  }
}

export { pool }

