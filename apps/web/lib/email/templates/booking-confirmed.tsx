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

export default function BookingConfirmedEmail({
  guestName = "Quý khách",
  bookingCode = "BM-20260330-XXXXXXXX",
  checkInDate = "2026-05-01",
  checkOutDate = "2026-05-03",
  roomType = "Combo 3N2D",
  depositAmount = 450000,
}: BookingConfirmedEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>✅ Đặt phòng ĐƯỢC XÁC NHẬN — Chuẩn bị hành lý thôi!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🌅 Bình Minh Homestay</Text>
            <Text style={tagline}>Đảo Minh Châu · Vân Đồn · Quảng Ninh</Text>
          </Section>

          {/* Hero — Confirmed */}
          <Section style={confirmedHero}>
            <Text style={checkmark}>✅</Text>
            <Heading style={heroHeading}>Đặt phòng được xác nhận!</Heading>
            <Text style={heroText}>
              Xin chào <strong>{guestName}</strong>! Bình Minh rất vui được đón bạn.
              Đây là thông tin xác nhận chính thức.
            </Text>
          </Section>

          {/* Booking Code */}
          <Section style={bookingCodeSection}>
            <Text style={bookingCodeLabel}>Mã xác nhận</Text>
            <Text style={bookingCodeText}>{bookingCode}</Text>
          </Section>

          <Hr style={divider} />

          {/* Details */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>Thông tin đặt phòng</Heading>
            <Row style={detailRow}>
              <Column style={detailLabel}>Hạng phòng</Column>
              <Column style={detailValue}>{roomType}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Nhận phòng</Column>
              <Column style={detailValue}>{formatDate(checkInDate)}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Trả phòng</Column>
              <Column style={detailValue}>{formatDate(checkOutDate)}</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Deposit Info */}
          <Section style={depositSection}>
            <Heading as="h2" style={sectionTitle}>💳 Đặt cọc (30%)</Heading>
            <Text style={depositAmount_}>Số tiền cọc: <strong style={depositHighlight}>{formatMoney(depositAmount)}</strong></Text>
            <Text style={depositNote}>
              Vui lòng chuyển khoản trước ngày nhận phòng ít nhất 48 giờ.
              Mọi thắc mắc, gọi hotline để được hỗ trợ.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Hẹn gặp lại tại Bình Minh Homestay! 🌊</Text>
            <Text style={footerMeta}>
              © 2026 Bình Minh Homestay · Đảo Minh Châu, Vân Đồn, Quảng Ninh
            </Text>
            <Text style={footerPolicy}>
              Dữ liệu bảo vệ theo Nghị định 13/2023/NĐ-CP.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = { backgroundColor: "#f5f0e8", fontFamily: "'Helvetica Neue', Arial, sans-serif" };
const container: React.CSSProperties = { margin: "0 auto", padding: "20px 0 48px", width: "600px", maxWidth: "100%" };
const header: React.CSSProperties = { padding: "32px 40px", backgroundColor: "#003366", borderRadius: "16px 16px 0 0", textAlign: "center" };
const logo: React.CSSProperties = { fontSize: "28px", fontWeight: "900", color: "#ffffff", margin: "0 0 4px" };
const tagline: React.CSSProperties = { fontSize: "13px", color: "#93c5fd", margin: "0", letterSpacing: "1px", textTransform: "uppercase" };
const confirmedHero: React.CSSProperties = { padding: "32px 40px 24px", backgroundColor: "#f0fdf4", textAlign: "center" };
const checkmark: React.CSSProperties = { fontSize: "48px", margin: "0 0 12px", display: "block" };
const heroHeading: React.CSSProperties = { fontSize: "26px", fontWeight: "900", color: "#15803d", margin: "0 0 12px" };
const heroText: React.CSSProperties = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0" };
const bookingCodeSection: React.CSSProperties = { padding: "20px 40px", backgroundColor: "#ecfdf5", borderLeft: "4px solid #22c55e", margin: "0 40px", borderRadius: "8px" };
const bookingCodeLabel: React.CSSProperties = { fontSize: "11px", color: "#166534", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px", fontWeight: "700" };
const bookingCodeText: React.CSSProperties = { fontSize: "26px", fontWeight: "900", color: "#003366", fontFamily: "monospace", letterSpacing: "2px", margin: "0" };
const divider: React.CSSProperties = { borderColor: "#e5e7eb", margin: "24px 40px" };
const detailsSection: React.CSSProperties = { padding: "0 40px" };
const sectionTitle: React.CSSProperties = { fontSize: "16px", fontWeight: "700", color: "#003366", margin: "0 0 16px" };
const detailRow: React.CSSProperties = { marginBottom: "10px" };
const detailLabel: React.CSSProperties = { fontSize: "13px", color: "#6b7280", width: "40%" };
const detailValue: React.CSSProperties = { fontSize: "14px", color: "#111827", fontWeight: "600" };
const depositSection: React.CSSProperties = { padding: "0 40px 24px" };
const depositAmount_: React.CSSProperties = { fontSize: "16px", color: "#374151", margin: "0 0 8px" };
const depositHighlight: React.CSSProperties = { color: "#dc2626", fontSize: "20px" };
const depositNote: React.CSSProperties = { fontSize: "13px", color: "#6b7280", lineHeight: "1.6", margin: "0" };
const footer: React.CSSProperties = { padding: "24px 40px 32px", backgroundColor: "#f9fafb", borderRadius: "0 0 16px 16px", textAlign: "center" };
const footerText: React.CSSProperties = { fontSize: "18px", color: "#003366", fontWeight: "700", margin: "0 0 8px" };
const footerMeta: React.CSSProperties = { fontSize: "11px", color: "#9ca3af", margin: "0 0 4px" };
const footerPolicy: React.CSSProperties = { fontSize: "10px", color: "#d1d5db", margin: "0" };
