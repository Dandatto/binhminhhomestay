import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

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

export default function BookingConfirmationEmail({
  guestName = "Quý khách",
  bookingCode = "BM-20260330-XXXXXXXX",
  checkInDate = "2026-05-01",
  checkOutDate = "2026-05-03",
  roomType = "Combo 3N2D",
  phone = "0900000000",
  note,
}: BookingConfirmationEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>🏖️ Bình Minh đã nhận được yêu cầu đặt phòng của bạn!</Preview>
      <Body style={main}>
        {/* Header */}
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>🌅 Bình Minh Homestay</Text>
            <Text style={tagline}>Đảo Minh Châu · Vân Đồn · Quảng Ninh</Text>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Heading style={heroHeading}>Yêu cầu đặt phòng đã được tiếp nhận</Heading>
            <Text style={heroText}>
              Xin chào <strong>{guestName}</strong>! Bình Minh đã nhận được yêu cầu của bạn
              và sẽ xác nhận trong vòng <strong>2-4 giờ làm việc</strong>.
            </Text>
          </Section>

          {/* Booking Code */}
          <Section style={bookingCodeSection}>
            <Text style={bookingCodeLabel}>Mã đặt phòng của bạn</Text>
            <Text style={bookingCodeText}>{bookingCode}</Text>
            <Text style={bookingCodeHint}>Lưu mã này để đối chiếu khi liên hệ với chúng tôi.</Text>
          </Section>

          <Hr style={divider} />

          {/* Details */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>Chi tiết đặt phòng</Heading>
            <Row style={detailRow}>
              <Column style={detailLabel}>Hạng phòng</Column>
              <Column style={detailValue}>{roomType}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Ngày nhận phòng</Column>
              <Column style={detailValue}>{formatDate(checkInDate)}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Ngày trả phòng</Column>
              <Column style={detailValue}>{formatDate(checkOutDate)}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Số điện thoại</Column>
              <Column style={detailValue}>{phone}</Column>
            </Row>
            {note && (
              <Row style={detailRow}>
                <Column style={detailLabel}>Ghi chú</Column>
                <Column style={detailValue}>{note}</Column>
              </Row>
            )}
          </Section>

          <Hr style={divider} />

          {/* Next Steps */}
          <Section style={stepsSection}>
            <Heading as="h2" style={sectionTitle}>Các bước tiếp theo</Heading>
            <Text style={step}><span style={stepNumber}>1</span> Nhân viên Bình Minh sẽ gọi điện xác nhận phòng qua số <strong>{phone}</strong>.</Text>
            <Text style={step}><span style={stepNumber}>2</span> Sau xác nhận, bạn sẽ nhận email hướng dẫn đặt cọc (30% giá phòng).</Text>
            <Text style={step}><span style={stepNumber}>3</span> Chuẩn bị hành lý nhẹ nhàng và tận hưởng hành trình ra đảo! 🚢</Text>
          </Section>

          <Hr style={divider} />

          {/* Vessel Info */}
          <Section style={vesselSection}>
            <Text style={vesselTitle}>🚢 Thông tin tàu từ Vân Đồn ra đảo Minh Châu</Text>
            <Text style={vesselText}>
              Tàu xuất phát từ bến Ao Tiên (Vân Đồn) — cách TP. Hạ Long khoảng 50km.
              Lịch tàu cập nhật hàng ngày, Bình Minh sẽ thông báo chuyến tàu phù hợp cho bạn.
            </Text>
            <Text style={hotline}>📞 Hotline: 0979.xxx.xxx (Zalo/Call)</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Email này được gửi tự động từ hệ thống đặt phòng của Bình Minh Homestay.
              Không trả lời trực tiếp email này.
            </Text>
            <Text style={footerText}>
              © 2026 Bình Minh Homestay · Đảo Minh Châu, Vân Đồn, Quảng Ninh
            </Text>
            <Text style={footerPolicy}>
              Thông tin của bạn được bảo vệ theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f5f0e8",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "600px",
  maxWidth: "100%",
};

const header: React.CSSProperties = {
  padding: "32px 40px",
  backgroundColor: "#003366",
  borderRadius: "16px 16px 0 0",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "900",
  color: "#ffffff",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const tagline: React.CSSProperties = {
  fontSize: "13px",
  color: "#93c5fd",
  margin: "0",
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const hero: React.CSSProperties = {
  padding: "32px 40px 24px",
  backgroundColor: "#ffffff",
};

const heroHeading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#003366",
  margin: "0 0 12px",
};

const heroText: React.CSSProperties = {
  fontSize: "15px",
  color: "#444",
  lineHeight: "1.6",
  margin: "0",
};

const bookingCodeSection: React.CSSProperties = {
  padding: "24px 40px",
  backgroundColor: "#fff8ed",
  borderLeft: "4px solid #f59e0b",
  margin: "0 40px",
  borderRadius: "8px",
};

const bookingCodeLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#92400e",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 0 6px",
  fontWeight: "700",
};

const bookingCodeText: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "900",
  color: "#003366",
  fontFamily: "monospace",
  letterSpacing: "2px",
  margin: "0 0 6px",
};

const bookingCodeHint: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 40px",
};

const detailsSection: React.CSSProperties = {
  padding: "0 40px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#003366",
  margin: "0 0 16px",
};

const detailRow: React.CSSProperties = {
  marginBottom: "10px",
};

const detailLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  width: "40%",
};

const detailValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: "600",
};

const stepsSection: React.CSSProperties = {
  padding: "0 40px",
};

const step: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const stepNumber: React.CSSProperties = {
  display: "inline-block",
  width: "22px",
  height: "22px",
  backgroundColor: "#003366",
  color: "#fff",
  borderRadius: "50%",
  fontSize: "12px",
  fontWeight: "700",
  textAlign: "center",
  lineHeight: "22px",
  marginRight: "10px",
};

const vesselSection: React.CSSProperties = {
  padding: "0 40px 24px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  margin: "0 40px",
};

const vesselTitle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1e40af",
  margin: "16px 0 8px",
};

const vesselText: React.CSSProperties = {
  fontSize: "13px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const hotline: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#003366",
  margin: "0",
};

const footer: React.CSSProperties = {
  padding: "0 40px",
  backgroundColor: "#f9fafb",
  borderRadius: "0 0 16px 16px",
};

const footerText: React.CSSProperties = {
  fontSize: "11px",
  color: "#9ca3af",
  textAlign: "center",
  margin: "8px 0",
};

const footerPolicy: React.CSSProperties = {
  fontSize: "10px",
  color: "#d1d5db",
  textAlign: "center",
  margin: "4px 0 16px",
};
