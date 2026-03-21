import React, { ReactNode } from 'react'

interface SmartFactoryWrapperProps {
  children: ReactNode
}

/**
 * 스마트팩토리 섹션 전용 래퍼 (구버전)
 * 새로운 AppLayout(ERP형태)으로 전환됨에 따라, 
 * 이 래퍼는 더이상 중복된 상단 네비게이션을 그리지 않고 children만 반환합니다.
 */
export default function SmartFactoryWrapper({ children }: SmartFactoryWrapperProps) {
  return (
    <div className="bg-white relative w-full">
      {children}
    </div>
  )
}
