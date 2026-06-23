import { useState, useEffect } from 'react'

// 每次最多显示几条
const PAGE_SIZE = 5

export default function WorldNews() {
  const [news, setNews]       = useState([])   // 当前显示的新闻列表
  const [loading, setLoading] = useState(true) // 是否正在加载
  const [error, setError]     = useState(null) // 错误信息
  const [ids, setIds]         = useState([])   // 全部热门 ID
  const [page, setPage]       = useState(0)    // 当前第几页

  // 第一步：页面加载时，拉取热门文章 ID 列表
  useEffect(() => {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(res => res.json())
      .then(data => {
        setIds(data)          // 存下全部 ID
        loadPage(data, 0)     // 加载第一页
      })
      .catch(() => setError('获取新闻失败，请稍后重试'))
  }, [])

  // 第二步：根据 ID 列表加载某一页的完整数据
  async function loadPage(allIds, pageIndex) {
    setLoading(true)
    setError(null)
    try {
      const start = pageIndex * PAGE_SIZE
      const pageIds = allIds.slice(start, start + PAGE_SIZE) // 取这一页的 5 个 ID
      // 并行请求这 5 条新闻的详情
      const articles = await Promise.all(
        pageIds.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(res => res.json())
        )
      )
      setNews(articles.filter(a => a && a.url)) // 过滤掉没有链接的
    } catch {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  function handleNextPage() {
    const next = page + 1
    setPage(next)
    loadPage(ids, next)
  }

  function handlePrevPage() {
    const prev = page - 1
    setPage(prev)
    loadPage(ids, prev)
  }

  return (
    <section className="world-news">
      <div className="world-news-header">
        <h2 className="world-news-title">🌍 看世界</h2>
        <span className="world-news-source">Hacker News 热榜</span>
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="world-news-loading">加载中...</div>
      )}

      {/* 报错 */}
      {error && (
        <div className="world-news-error">{error}</div>
      )}

      {/* 新闻列表 */}
      {!loading && !error && (
        <ul className="world-news-list">
          {news.map(item => (
            <li key={item.id} className="world-news-item">
              <a href={item.url} target="_blank" rel="noreferrer" className="world-news-link">
                <span className="world-news-item-title">{item.title}</span>
                <span className="world-news-item-meta">
                  🔥 {item.score} · {item.by}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* 翻页 */}
      {!loading && !error && (
        <div className="world-news-pagination">
          <button
            className="world-news-page-btn"
            onClick={handlePrevPage}
            disabled={page === 0}
          >← 上一页</button>
          <span className="world-news-page-num">第 {page + 1} 页</span>
          <button
            className="world-news-page-btn"
            onClick={handleNextPage}
            disabled={(page + 1) * PAGE_SIZE >= ids.length}
          >下一页 →</button>
        </div>
      )}
    </section>
  )
}
