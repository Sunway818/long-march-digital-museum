import { Component } from 'react'
import type { ReactNode } from 'react'

export function ChapterLoading({children}:{children:ReactNode}){
 return <div className="chapter-loading" role="status"><p>{children}</p><a href="#home">返回首页</a></div>
}

/** 本地分包加载失败也保留可操作的返回入口，不让章节成为空白页。 */
export class ChapterBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return{failed:true}}
 render(){
  return this.state.failed?<div className="chapter-loading" role="alert"><p>这一章暂未载入，请检查连接后重试。</p><a href="#home">返回首页</a><button onClick={()=>location.reload()}>重新加载页面</button></div>:this.props.children
 }
}
