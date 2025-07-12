"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Header } from "~~/components/Header";

const Home: NextPage = () => {
  const expiryOptions = [
    { label: "31 JUL 25", value: "2025-07-31" },
    { label: "31 AUG 25", value: "2025-08-31" },
    { label: "30 SEP 25", value: "2025-09-30" },
  ];

  // default selected expiry
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ type: "bid" | "ask"; strike: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 이더리움 현재가 fetchƒ
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchEthPrice = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setEthPrice(data.ethereum.usd);
    } catch (e) {
      setEthPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-b from-[#1a133a] via-[#2a215a] to-[#18122b] flex flex-col text-white px-8">
        <Header />

        {/* ETH-옵션 관련 정보 영역*/}
        <div className="text-white rounded-xl p-2 mb- shadow">
          <div className="text-lg font-bold">Options(ETH)</div>
          <div className="mt-1">
            ETH Current Value: {loading ? "LOADING..." : ethPrice !== null ? `$${ethPrice}` : null}
          </div>
          <div className="mt-1">Today Date: {todayStr}</div>
        </div>

        {/* 만료 일자 선택 영역 */}
        <div className="flex gap-3">
          {expiryOptions.map(option => {
            return (
              <button
                onClick={() => setSelectedExpiry(option.value)}
                key={option.value}
                className={`cursor-pointer border border-white rounded-lg px-3 py-1 ${selectedExpiry === option.value ? "bg-white text-black" : ""}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* 대시보드 */}
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full border-[#232B23] text-center">
            <thead>
              <tr>
                <th colSpan={5} className="text-lg font-bold py-3" style={{ borderTopLeftRadius: 8 }}>
                  calls
                </th>
                <th colSpan={1} className="text-lg font-bold py-3">
                  {selectedExpiry ?? "Expiry Date"}
                </th>
                <th colSpan={5} className="text-lg font-bold py-3" style={{ borderTopRightRadius: 8 }}>
                  puts
                </th>
              </tr>

              <tr className="bg-[#1F2122] text-white">
                <th className="py-3">Size</th>
                <th className="py-3">Bid</th>
                <th className="py-3">Mark</th>
                <th className="py-3">Ask</th>
                <th className="py-3">Size</th>
                <th className="py-3">Strike</th>
                <th className="py-3">Size</th>
                <th className="py-3">Bid</th>
                <th className="py-3">Mark</th>
                <th className="py-3">Ask</th>
                <th className="py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {["2,700", "2,800", "2,900", "3,000", "3,100", "3,200"].map((strike, index) => (
                <tr key={strike} className={index % 2 === 0 ? "bg-[#18122b]" : "bg-[#1F2122]"}>
                  {/* 콜 */}
                  <td className=" h-12"></td>
                  <td
                    className=" cursor-pointer hover:bg-[#E5E3FF]"
                    onClick={() => {
                      setSelectedOrder({ type: "bid", strike });
                      setShowConfirm(true);
                    }}
                  >
                    {/* Bid */}
                  </td>
                  <td className=""></td>
                  <td
                    className=" cursor-pointer hover:bg-[#E5E3FF]"
                    onClick={() => {
                      setSelectedOrder({ type: "ask", strike });
                      setShowConfirm(true);
                    }}
                  >
                    {/* Ask */}
                  </td>
                  <td className=""></td>
                  {/* Strike */}
                  <td className=" font-bold">{strike}</td>
                  {/* 풋 */}
                  <td className=""></td>
                  <td
                    className=" cursor-pointer hover:bg-[#E5E3FF]"
                    onClick={() => {
                      setSelectedOrder({ type: "bid", strike });
                      setShowConfirm(true);
                    }}
                  >
                    {/* Bid */}
                  </td>
                  <td className=""></td>
                  <td
                    className=" cursor-pointer hover:bg-[#E5E3FF]"
                    onClick={() => {
                      setSelectedOrder({ type: "ask", strike });
                      setShowConfirm(true);
                    }}
                  >
                    {/* Ask */}
                  </td>
                  <td className=""></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 컨펌 모달 */}
        {showConfirm && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 text-black gap-3">
            <div className="bg-white rounded-xl p-8 min-w-[340px] text-center">
              <div className="mb-4 text-lg font-bold">
                옵션: ETHUSD-{selectedExpiry?.replace(/-/g, "").toUpperCase()} ({selectedOrder?.type.toUpperCase()})
              </div>
              <div className="mb-2">행사가: {selectedOrder.strike}</div>
              <div className="mb-2">공정가치: 0.00</div>
              <div className="mb-4 flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <label className="font-semibold">가격:</label>
                  <input type="number" step="0.001" min="0" className="border rounded px-2 py-1 w-24" />
                  <span className="ml-1 text-xs text-gray-500">ETH</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold">Size:</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-24" />
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-[#766CF5] text-white rounded"
                  onClick={() => {
                    // 실제 주문 로직 추가
                    setShowConfirm(false);
                    setSelectedOrder(null);
                  }}
                >
                  확인
                </button>
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowConfirm(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
