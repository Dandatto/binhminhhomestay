export type BookingConfirmationEmailProps = {
  guestName: string;
  bookingCode: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  phone: string;
  note?: string;
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

export default function BookingConfirmationEmail(props: BookingConfirmationEmailProps): string {
  const {
    guestName = "Quý khách",
    bookingCode = "BM-20260330-XXXXXXXX",
    checkInDate = "2026-05-01",
    checkOutDate = "2026-05-03",
    roomType = "Combo 3N2D",
    phone = "0900000000",
    note,
  } = props;

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
  </head>
  <body style="background-color: #f5f0e8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="display: none; opacity: 0; overflow: hidden; max-height: 0;">🏖️ Bình Minh đã nhận được yêu cầu đặt phòng của bạn!</div>
    <div style="margin: 0 auto; padding: 20px 0 48px; width: 600px; max-width: 100%;">
      
      <!-- Header -->
      <div style="padding: 32px 40px; background-color: #003366; border-radius: 16px 16px 0 0; text-align: center;">
        <p style="font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px;">🌅 Bình Minh Homestay</p>
        <p style="font-size: 13px; color: #93c5fd; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Đảo Minh Châu &middot; Vân Đồn &middot; Quảng Ninh</p>
      </div>

      <!-- Hero -->
      <div style="padding: 32px 40px 24px; background-color: #ffffff;">
        <h1 style="font-size: 24px; font-weight: 800; color: #003366; margin: 0 0 12px;">Yêu cầu đặt phòng đã được tiếp nhận</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0;">
          Xin chào <strong>${guestName}</strong>! Bình Minh đã nhận được yêu cầu của bạn 
          và sẽ xác nhận trong vòng <strong>2-4 giờ làm việc</strong>.
        </p>
      </div>

      <!-- Booking Code -->
      <div style="padding: 24px 40px; background-color: #fff8ed; border-left: 4px solid #f59e0b; margin: 0 40px; border-radius: 8px;">
        <p style="font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px; font-weight: 700;">Mã đặt phòng của bạn</p>
        <p style="font-size: 28px; font-weight: 900; color: #003366; font-family: monospace; letter-spacing: 2px; margin: 0 0 6px;">${bookingCode}</p>
        <p style="font-size: 12px; color: #6b7280; margin: 0;">Lưu mã này để đối chiếu khi liên hệ với chúng tôi.</p>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Details -->
      <div style="padding: 0 40px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #003366; margin: 0 0 16px;">Chi tiết đặt phòng</h2>
        <table style="width: 100%; margin-bottom: 16px;">
          <tbody>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Hạng phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${roomType}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Ngày nhận phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${formatDate(checkInDate)}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Ngày trả phòng</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${formatDate(checkOutDate)}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Số điện thoại</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${phone}</td>
            </tr>
            ${note ? `
            <tr>
              <td style="font-size: 13px; color: #6b7280; width: 40%; padding-bottom: 10px;">Ghi chú</td>
              <td style="font-size: 14px; color: #111827; font-weight: 600; padding-bottom: 10px;">${note.replace(/</g, "&lt;")}</td>
            </tr>` : ""}
          </tbody>
        </table>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Next Steps -->
      <div style="padding: 0 40px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #003366; margin: 0 0 16px;">Các bước tiếp theo</h2>
        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px;"><span style="display: inline-block; width: 22px; height: 22px; background-color: #003366; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; margin-right: 10px;">1</span> Nhân viên Bình Minh sẽ gọi điện xác nhận phòng qua số <strong>${phone}</strong>.</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px;"><span style="display: inline-block; width: 22px; height: 22px; background-color: #003366; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; margin-right: 10px;">2</span> Sau xác nhận, bạn sẽ nhận email hướng dẫn đặt cọc (30% giá phòng).</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px;"><span style="display: inline-block; width: 22px; height: 22px; background-color: #003366; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; margin-right: 10px;">3</span> Chuẩn bị hành lý nhẹ nhàng và tận hưởng hành trình ra đảo! 🚢</p>
      </div>

      <hr style="border-color: #e5e7eb; border-style: solid; border-width: 1px 0 0 0; margin: 24px 40px;" />

      <!-- Footer -->
      <div style="padding: 24px 40px 32px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 8px 0;">Email này được gửi tự động. KHÔNG TRẢ LỜI ĐỊA CHỈ NÀY.</p>
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 8px 0;">&copy; 2026 Bình Minh Homestay &middot; Đảo Minh Châu, Vân Đồn, Quảng Ninh</p>
      </div>

    </div>
  </body>
</html>`;
}
