import React from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  LayoutDashboard,
  Factory,
  Eye,
  Award,
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800/60 text-white py-10 w-full shrink-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* 기관 정보 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">한국 품질재단</h3>
                <p className="text-blue-400 text-xs font-medium">AI 스마트팩토리 실습 플랫폼</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              제조 AI 데이터분석 및 스마트팩토리 현장 적용 역량 강화를 위한
              공식 실습 교육 환경입니다.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-gray-400">서울특별시 구로구 디지털로 30길 28</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-gray-400">02-2025-9000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-gray-400">kfq@kfq.or.kr</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="https://www.kfq.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  www.kfq.or.kr
                </a>
              </div>
            </div>
          </div>

          {/* 실습 모듈 */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-blue-400">스마트팩토리 실습 모듈</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/sf-dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <LayoutDashboard className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  통합 대시보드 — 생산 품질 현황
                </a>
              </li>
              <li>
                <a href="/sf-production" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <Factory className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                  작업실적 등록 — MES 바코드 연동
                </a>
              </li>
              <li>
                <a href="/sf-vision" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <Eye className="w-3.5 h-3.5 text-gray-600 group-hover:text-violet-400 transition-colors" />
                  AI 비전 검사 — 실시간 불량 감지
                </a>
              </li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-purple-400">고객지원</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/help-center" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">이용약관</a>
              </li>
              <li>
                <a href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">쿠키정책</a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-gray-800/60 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} 한국 품질재단 (Korea Foundation for Quality). All Rights Reserved.
          </p>
          <p className="text-gray-700 text-xs mt-1">
            본 실습 플랫폼은 제조 AI 스마트팩토리 교육 목적으로 운영됩니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
