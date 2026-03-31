"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Info, QrCode, Copy, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { DandattoHover } from "@/components/MicroInteractions";

function formatMoney(val: string) {
  if (!val) return "";
  return parseInt(val, 10).toLocaleString('vi-VN') + "đ";
}

type BookingResult = {
  bookingId: string;
  bookingCode: string;
};

type PaymentData = {
  depositAmount: number;
  description: string;
  accountNo: string;
  accountName: string;
  qrDataUrl: string | null;
  paymentOptions: { name: string; icon: string; desc: string }[];
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [pricing, setPricing] = useState<Record<string, string> | null>(null);

  // Form states
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomType, setRoomType] = useState("Combo 3N2D");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/v1/pricing").then(r => r.json()).then(d => setPricing(d.pricing));
  }, []);

  const submitBooking = async () => {
    if (!guestName || !phone || !checkInDate || !checkOutDate || !consentGiven) {
      toast.error("Vui lòng điền đủ thông tin và đồng ý chính sách bảo mật!");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang gửi yêu cầu đặt phòng...");
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          phone,
          email: email || undefined,
          checkInDate,
          checkOutDate,
          roomType,
          consentGiven,
          consentVersion: "v1.0"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        toast.dismiss(loadingToast);
        toast.error("Lỗi: " + (err.error || "Không thể gửi yêu cầu"));
        return;
      }

      const data = await res.json();
      toast.dismiss(loadingToast);
      toast.success("Đặt phòng thành công!");
      setBookingResult({ bookingId: data.bookingId, bookingCode: data.bookingCode });
      setStep(4); // Success step

      // Lấy QR cọc
      setLoadingQR(true);
      const qrRes = await fetch(`/api/v1/payment-qr?bookingId=${data.bookingId}&bookingCode=${data.bookingCode}`);
      if (qrRes.ok) {
        setPaymentData(await qrRes.json());
      }
      setLoadingQR(false);
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(bookingResult?.bookingCode ?? "");
    setCopied(true);
    toast.success("Đã copy mã đặt phòng!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="pt-48 pb-32 px-6 bg-sand-white min-h-screen">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-ocean-blue tracking-tight">The Sanctuary.</h1>
          <p className="text-ocean-blue/60 font-medium">Quy trình đặt phòng tự động, minh bạch và bảo mật.</p>
        </header>

        {/* Steps Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between w-full max-w-sm mx-auto">
            <BookingStep number={1} active={step >= 1} label="Ngày đi" />
            <div className="h-px bg-ocean-blue/10 flex-1" />
            <BookingStep number={2} active={step >= 2} label="Phòng nghỉ" />
            <div className="h-px bg-ocean-blue/10 flex-1" />
            <BookingStep number={3} active={step >= 3} label="Cam kết" />
          </div>
        )}

        {/* Step Content Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[40px] shadow-soft border border-ocean-blue/5"
        >
          {/* STEP 1: Ngày */}
          {step === 1 && (
            <div className="space-y-8 text-center pt-8">
              <h2 className="text-2xl font-bold text-ocean-blue">Khi nào bạn muốn nghỉ ngơi?</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 text-left space-y-2">
                  <label className="text-xs font-bold text-ocean-blue/50 uppercase ml-2">Check-in</label>
                  <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)}
                    className="w-full bg-sand-white p-5 rounded-2xl border border-ocean-blue/5 outline-none focus:border-sunrise-yellow transition-colors" />
                </div>
                <div className="flex-1 text-left space-y-2">
                  <label className="text-xs font-bold text-ocean-blue/50 uppercase ml-2">Check-out</label>
                  <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)}
                    className="w-full bg-sand-white p-5 rounded-2xl border border-ocean-blue/5 outline-none focus:border-sunrise-yellow transition-colors" />
                </div>
              </div>
              <DandattoHover className="inline-block w-full">
                <button
                  onClick={() => {
                    if (!checkInDate || !checkOutDate) return toast.error("Vui lòng chọn ngày check-in và check-out");
                    if (checkOutDate <= checkInDate) return toast.error("Ngày check-out phải sau ngày check-in");
                    setStep(2);
                  }}
                  className="bg-ocean-blue text-white w-full py-5 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                >
                  Tiếp theo →
                </button>
              </DandattoHover>
            </div>
          )}

          {/* STEP 2: Phòng */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-ocean-blue">Chọn &quot;nơi trú ẩn&quot; của bạn</h2>
              {pricing ? (
                <>
                  <div className="space-y-4">
                    <RoomOption
                      name="Combo 3N2D"
                      price={formatMoney(pricing['pricing_combo'])}
                      desc="Tàu khứ hồi + Ăn 3 bữa + Xe điện + Phòng tiêu chuẩn"
                      badge="⭐ Phổ biến nhất"
                      selected={roomType === "Combo 3N2D"}
                      onSelect={() => setRoomType("Combo 3N2D")}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RoomOption name="Căn Phi thuyền 2 giường" price={formatMoney(pricing['pricing_room_2_bed'])} desc="2 giường 1.6m — cho cả gia đình." selected={roomType === "Căn Phi thuyền 2 giường"} onSelect={() => setRoomType("Căn Phi thuyền 2 giường")} />
                      <RoomOption name="Căn Phi thuyền 1 giường" price={formatMoney(pricing['pricing_room_1_bed'])} desc="1 giường 1.6m cực rộng." selected={roomType === "Căn Phi thuyền 1 giường"} onSelect={() => setRoomType("Căn Phi thuyền 1 giường")} />
                      <RoomOption name="Homestay 2 giường" price={formatMoney(pricing['pricing_homestay_2_bed'])} desc="2 giường 1.4m tinh tế." selected={roomType === "Homestay 2 giường"} onSelect={() => setRoomType("Homestay 2 giường")} />
                      <RoomOption name="Homestay 1 giường" price={formatMoney(pricing['pricing_homestay_1_bed'])} desc="1 giường 1.4m ấm cúng." selected={roomType === "Homestay 1 giường"} onSelect={() => setRoomType("Homestay 1 giường")} />
                    </div>
                  </div>
                  <p className="text-[10px] text-ocean-blue/40 italic text-center">
                    * Cuối tuần & ngày lễ có thể phụ thu thêm tùy thời điểm.
                  </p>
                </>
              ) : (
                <p className="text-center text-ocean-blue/50 py-10 font-medium animate-pulse">Đang tải bảng giá...</p>
              )}
              <button onClick={() => setStep(3)} className="bg-ocean-blue text-white w-full py-5 rounded-2xl font-bold text-lg hover:shadow-lg transition-all">
                Xác nhận phòng →
              </button>
            </div>
          )}

          {/* STEP 3: Thông tin + Cam kết */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-green-600 bg-green-50 p-4 rounded-2xl">
                <ShieldCheck className="w-8 h-8 shrink-0" />
                <p className="text-sm font-semibold">Dữ liệu của bạn được bảo mật theo Nghị định 13/2023/NĐ-CP.</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ocean-blue">Dữ liệu liên hệ</h2>
                <input
                  type="text" placeholder="Họ và tên người đặt *"
                  value={guestName} onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-sand-white p-5 rounded-2xl border border-ocean-blue/5 outline-none focus:border-sunrise-yellow transition-colors font-bold text-ocean-blue"
                />
                <input
                  type="tel" placeholder="Số điện thoại (Zalo nếu có) *"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-sand-white p-5 rounded-2xl border border-ocean-blue/5 outline-none focus:border-sunrise-yellow transition-colors font-bold text-ocean-blue"
                />
                <input
                  type="email" placeholder="Email (để nhận vé xác nhận đặt phòng)"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-sand-white p-5 rounded-2xl border border-sky-blue/20 outline-none focus:border-sunrise-yellow transition-colors text-ocean-blue"
                />
                <p className="text-xs text-ocean-blue/40 italic ml-1">Email không bắt buộc nhưng giúp bạn nhận vé xác nhận nhanh hơn.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-sky-blue/20">
                <h2 className="text-xl font-bold text-ocean-blue">Một cam kết nhỏ</h2>
                <p className="text-sm text-ocean-blue/60 italic leading-relaxed">
                  &quot;Bình Minh sẽ vẫn ở đây chờ bạn. Nếu có bão, chúng tôi hoàn lại 100%. Nếu có thay đổi, hãy báo trước 2 ngày. Đơn giản vậy thôi.&quot;
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="consent" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className="w-5 h-5 accent-ocean-blue shrink-0" />
                  <label htmlFor="consent" className="text-sm font-medium text-ocean-blue cursor-pointer">
                    Tôi đồng ý với chính sách bảo mật dữ liệu cá nhân.
                  </label>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={submitBooking}
                className="bg-sunrise-yellow text-ocean-blue w-full py-5 rounded-2xl font-black text-xl hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "ĐANG XỬ LÝ..." : "GỬI YÊU CẦU ĐẶT PHÒNG"}
              </button>
            </div>
          )}

          {/* STEP 4: Success + Payment QR */}
          {step === 4 && bookingResult && (
            <div className="space-y-8">
              {/* Success Banner */}
              <div className="text-center space-y-3">
                <div className="text-6xl">🎉</div>
                <h2 className="text-3xl font-black text-ocean-blue">Đã tiếp nhận!</h2>
                <p className="text-ocean-blue/60">Bình Minh sẽ gọi xác nhận trong vòng 2-4 giờ.</p>
              </div>

              {/* Booking Code */}
              <div className="bg-ocean-blue/5 rounded-2xl p-6 text-center space-y-2">
                <p className="text-xs font-bold text-ocean-blue/50 uppercase tracking-widest">Mã đặt phòng</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-ocean-blue tracking-widest">
                    {bookingResult.bookingCode}
                  </span>
                  <button onClick={copyCode} className="text-ocean-blue/50 hover:text-ocean-blue transition-colors">
                    {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-ocean-blue/40">Lưu mã này để tra cứu và đối chiếu.</p>
              </div>

              {/* Payment Section */}
              <div className="border-t border-sky-blue/20 pt-6">
                <h3 className="text-xl font-bold text-ocean-blue mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" /> Đặt cọc 30% để giữ phòng
                </h3>

                {loadingQR && (
                  <div className="text-center text-ocean-blue/50 animate-pulse py-6">Đang tạo mã QR thanh toán...</div>
                )}

                {paymentData && !loadingQR && (
                  <div className="space-y-6">
                    {/* Amount */}
                    <div className="bg-sunrise-yellow/10 border border-sunrise-yellow/30 rounded-2xl p-4 text-center">
                      <p className="text-sm text-ocean-blue/60">Số tiền cọc (30%)</p>
                      <p className="text-4xl font-black text-ocean-blue">
                        {paymentData.depositAmount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-ocean-blue/40 mt-1">Nội dung: <strong>{paymentData.description}</strong></p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* QR Code */}
                      {paymentData.qrDataUrl && (
                        <div className="text-center space-y-3 relative">
                          <p className="text-sm font-bold text-ocean-blue/60">Scan QR bằng mọi app ngân hàng</p>
                          <div className="relative w-48 h-48 mx-auto rounded-xl border border-sky-blue/20 bg-white p-2 overflow-hidden flex items-center justify-center">
                            <Image
                              src={paymentData.qrDataUrl}
                              alt="VietQR Payment Code"
                              fill
                              className="object-contain p-2"
                              unoptimized={true}
                            />
                          </div>
                          <p className="text-xs text-ocean-blue/40">Hỗ trợ tất cả ngân hàng + MoMo + ZaloPay</p>
                        </div>
                      )}

                      {/* Account Info */}
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-ocean-blue/60">Thông tin chuyển khoản</p>
                        <div className="bg-sand-white rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-ocean-blue/50">Chủ TK</span>
                            <span className="font-bold text-ocean-blue">{paymentData.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ocean-blue/50">STK</span>
                            <span className="font-mono font-bold text-ocean-blue">{paymentData.accountNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ocean-blue/50">Nội dung</span>
                            <span className="font-bold text-ocean-blue">{paymentData.description}</span>
                          </div>
                        </div>

                        {/* Payment options */}
                        <div className="space-y-2">
                          {paymentData.paymentOptions.map((opt) => (
                            <div key={opt.name} className="flex items-center gap-3 bg-white border border-sky-blue/10 rounded-xl px-4 py-3">
                              <span className="text-xl">{opt.icon}</span>
                              <div>
                                <p className="text-sm font-bold text-ocean-blue">{opt.name}</p>
                                <p className="text-xs text-ocean-blue/50">{opt.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-ocean-blue/40 italic text-center">
                      * Đặt cọc giữ phòng tới khi nhân viên xác nhận. Hoàn 100% nếu hủy do bão/thiên tai.
                    </p>
                  </div>
                )}
              </div>

              {/* Back to home */}
              <a href="/" className="block text-center text-sm text-ocean-blue/50 hover:text-ocean-blue font-medium transition-colors">
                ← Quay về trang chủ
              </a>
            </div>
          )}
        </motion.div>

        {/* FAQ hint */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 text-ocean-blue/40 text-sm font-medium">
            <Info className="w-4 h-4" />
            <span>Bạn cần hỗ trợ? Xem nhanh các câu hỏi thường gặp.</span>
          </div>
        )}
      </div>
    </main>
  );
}

function BookingStep({ number, active, label }: { number: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${active ? "bg-ocean-blue text-white" : "bg-ocean-blue/10 text-ocean-blue/30"}`}>
        {active ? <Check className="w-4 h-4" /> : number}
      </div>
      <span className={`text-[10px] uppercase tracking-wider font-bold ${active ? "text-ocean-blue" : "text-ocean-blue/30"}`}>{label}</span>
    </div>
  );
}

function RoomOption({ name, price, desc, selected, onSelect, badge }: any) {
  return (
    <div onClick={onSelect} className={`p-6 border-2 rounded-3xl text-left transition-all cursor-pointer relative ${selected ? 'border-sunrise-yellow bg-sunrise-yellow/5 shadow-md' : 'border-ocean-blue/5 hover:border-sky-blue/30'}`}>
      {badge && (
        <span className="absolute -top-3 left-5 text-xs bg-sunrise-yellow text-ocean-blue px-3 py-0.5 rounded-full font-bold">{badge}</span>
      )}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-ocean-blue text-lg pr-4">{name}</h4>
        <span className="text-sunrise-yellow font-black whitespace-nowrap">{price}</span>
      </div>
      <p className="text-sm text-ocean-blue/60">{desc}</p>
    </div>
  );
}
