import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStore } from "@/lib/store";

export const revalidate = 0;

// BIN codes của các ngân hàng phổ biến Việt Nam
// Xem thêm: https://vietqr.io/danh-sach-ngan-hang
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BANK_LIST = [
  { bin: "970436", name: "Vietcombank", shortName: "VCB", logo: "https://api.vietqr.io/img/VCB.png" },
  { bin: "970418", name: "BIDV", shortName: "BIDV", logo: "https://api.vietqr.io/img/BIDV.png" },
  { bin: "970415", name: "Vietinbank", shortName: "CTG", logo: "https://api.vietqr.io/img/CTG.png" },
  { bin: "970422", name: "MB Bank", shortName: "MB", logo: "https://api.vietqr.io/img/MB.png" },
  { bin: "970432", name: "VPBank", shortName: "VPB", logo: "https://api.vietqr.io/img/VPB.png" },
  { bin: "970407", name: "Techcombank", shortName: "TCB", logo: "https://api.vietqr.io/img/TCB.png" },
  { bin: "970405", name: "Agribank", shortName: "AGR", logo: "https://api.vietqr.io/img/AGR.png" },
  { bin: "796500001", name: "MoMo", shortName: "MOMO", logo: "https://api.vietqr.io/img/MOMO.png" },
  { bin: "963388", name: "ZaloPay", shortName: "ZALO", logo: "https://api.vietqr.io/img/ZALOPAY.png" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  const bookingCode = searchParams.get("bookingCode");

  if (!bookingId && !bookingCode) {
    return new NextResponse("Bad Request: bookingId or bookingCode required", { status: 400 });
  }

  try {
    const store = getStore();
    let depositAmount = 450000; // fallback
    let description = `DAT COC ${bookingCode ?? bookingId ?? ""}`;

    if (bookingId) {
      const booking = await store.getBookingById(bookingId);
      if (booking) {
        const settings = await store.getSettings();
        // Tìm giá dựa vào roomType
        const priceKey = (() => {
          const rt = booking.roomType.toLowerCase();
          if (rt.includes("phi thuyền") && rt.includes("2")) return "pricing_room_2_bed";
          if (rt.includes("phi thuyền") && rt.includes("1")) return "pricing_room_1_bed";
          if (rt.includes("homestay") && rt.includes("2")) return "pricing_homestay_2_bed";
          if (rt.includes("homestay") && rt.includes("1")) return "pricing_homestay_1_bed";
          return "pricing_room_1_bed";
        })();
        const basePrice = parseInt(settings[priceKey] ?? "1200000");
        depositAmount = Math.round(basePrice * env.depositRatio);
        description = `DAT COC 30% ${booking.bookingCode}`;
      }
    }

    const accountNo = env.vietqrAccountNo;
    const bankBin = env.vietqrBankBin;
    const accountName = env.vietqrAccountName;

    // Gọi VietQR.io API (public, không cần key)
    const vietqrUrl = `https://api.vietqr.io/v2/generate`;
    const vietqrRes = await fetch(vietqrUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNo,
        accountName,
        acqId: bankBin,
        amount: depositAmount,
        addInfo: description,
        format: "compact",
        template: "compact",
      }),
    });

    let qrDataUrl: string | null = null;
    let qrCode: string | null = null;

    if (vietqrRes.ok) {
      const vietqrData = await vietqrRes.json() as any;
      qrDataUrl = vietqrData?.data?.qrDataURL ?? null;
      qrCode = vietqrData?.data?.qrCode ?? null;
    } else {
      // Fallback: build QR URL trực tiếp (static embed)
      qrDataUrl = `https://api.vietqr.io/image/${bankBin}-${accountNo}-${env.vietqrAccountName.replace(/\s/g, "_")}.jpg?amount=${depositAmount}&addInfo=${encodeURIComponent(description)}`;
    }

    return NextResponse.json({
      depositAmount,
      depositRatio: env.depositRatio,
      description,
      accountNo,
      accountName,
      bankBin,
      qrDataUrl,
      qrCode,
      paymentOptions: [
        { name: "VietQR (Tất cả ngân hàng)", icon: "🏦", desc: "Scan QR bằng app ngân hàng bất kỳ" },
        { name: "MoMo", icon: "💜", desc: "Chuyển qua số điện thoại: 0979xxx" },
        { name: "Tiền mặt khi nhận phòng", icon: "💵", desc: "Đặt cọc khi đến Homestay" },
      ]
    });
  } catch (error) {
    console.error("[PaymentQR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
