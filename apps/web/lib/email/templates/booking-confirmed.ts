export type BookingConfirmedEmailProps = {
  guestName: string;
  bookingCode: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  depositAmount: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  } catch {
    return iso;
  }
}

function formatMoney(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function BookingConfirmedEmail(props: BookingConfirmedEmailProps): string {
  const {
    guestName = "Quý khách",
    bookingCode = "BM-20260330-XXXXXXXX",
    checkInDate = "2026-05-01",
    checkOutDate = "2026-05-03",
    roomType = "Combo 3N2D",
    depositAmount = 450000,
  } = props;

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
  </head>
  <body style="background-color: #f5f0e8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="display: none; opacity: 0; overflow: hidden; max-height: 0;">✅ Đặt phòng ĐƯỢC XÁC NHẬN — Chuẩn bị hành lý thôi!</div>
    <div style="margin: 0 auto; padding: 20px 0 48px; width: 600px; max-width: 100%;">
      
      <!-- Header -->
      <div style="padding: 32px 40px; background-color: #003366; border-radius: 16px 16px 0 0; text-align: center;">
        <p style="font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px;">🌅 Bình Minh Homestay</p>
        <p style="font-size: 13px; color: #93c5fd; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Đảo Minh Châu &middot; Vân Đồn &middot; Quảng Ninh</p>
      </div>

      <!-- Hero -->
      <div style="padding: 32px 40px 24px; background-color: #f0fdf4; text-align: center;">
        <p style="font-size: 48px; margin: 0 0 12px; display: block;">✅</p>
        <h1 style="font-size: 26px; font-weight: 900; color: #15803d; margin: 0 0 12px;">Đặt phòng được xác nhận!</h1>
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0;">
          Xin chào <strong>${guestName}</strong>! Bình Minh rất vui được đón bạn.
          Đây là thông tin xác nhận chính thức.
        </p>
      </div>

      <!-- Booking Code -->
      <div style="padding: 20px 40px; background-color: #ecfdf5; border-left: 4px solid #22c55e; margin: 0 40px; border-radius: 8px;">
        <p style="font-size: 11px; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px; font-weight: 700;">Mã xác nhận</p>
        <p style="font-size: 26px; font-weight: 900; color: #003366; font-family: monospace; letter-spacing: 2px; margin: 0;">${bookingCode}</p>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Details -->
      <div style="padding: 0 40px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #003366; margin: 0 0 16px;">Thông tin đặt phòng</h2>
        <table style="width: 100%; margin-bottom: 16px;">
          <tbody>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Hạng phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${roomType}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Nhận phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${formatDate(checkInDate)}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Trả phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${formatDate(checkOutDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Deposit Info -->
      <div style="padding: 0 40px 24px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #003366; margin: 0 0 16px;">💳 Đặt cọc (30%)</h2>
        <p style="font-size: 16px; color: #374151; margin: 0 0 8px;">Số tiền cọc: <strong style="color: #dc2626; font-size: 20px;">${formatMoney(depositAmount)}</strong></p>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0;">
          Vui lòng chuyển khoản trước ngày nhận phòng ít nhất 48 giờ.
          Mọi thắc mắc, gọi hotline để được hỗ trợ.
        </p>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Footer -->
      <div style="padding: 24px 40px 32px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
        <p style="font-size: 18px; color: #003366; font-weight: 700; margin: 0 0 8px;">Hẹn gặp lại tại Bình Minh Homestay! 🌊</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 0 0 4px;">&copy; 2026 Bình Minh Homestay &middot; Đảo Minh Châu, Vân Đồn, Quảng Ninh</p>
        <p style="font-size: 10px; color: #d1d5db; margin: 0;">Dữ liệu bảo vệ theo Nghị định 13/2023/NĐ-CP.</p>
      </div>

    </div>
  </body>
</html>`;
}
