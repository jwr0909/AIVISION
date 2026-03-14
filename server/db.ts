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
        item_cd VARCHAR(40) PRIMARY KEY,
        item_name VARCHAR(60) NOT NULL,
        std VARCHAR(60),
        unit_cd VARCHAR(5)
      );
    `)
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
    await client.query(`DROP TRIGGER IF EXISTS trigger_feed_comments_count ON feed_comments`)
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

