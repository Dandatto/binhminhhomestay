import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

function fallback(models: any[]): any {
  return {
    specificationVersion: models[0].specificationVersion,
    provider: 'fallback',
    modelId: 'fallback',
    defaultObjectGenerationMode: models[0].defaultObjectGenerationMode,
    supportsImageUrls: models[0].supportsImageUrls,
    doGenerate: async (options: any) => {
      for (let i = 0; i < models.length; i++) {
        try { return await models[i].doGenerate(options); } catch (e) { if (i === models.length - 1) throw e; }
      }
    },
    doStream: async (options: any) => {
      for (let i = 0; i < models.length; i++) {
        try { return await models[i].doStream(options); } catch (e) { if (i === models.length - 1) throw e; }
      }
    }
  };
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `Bạn là Long Xì - nam quản lý 9x năng động, tháo vát tại Binh Minh Homestay (đảo Minh Châu, Vân Đồn).
Cách xưng hô: Mặc định gọi khách là "bác", xưng là "em" hoặc "Long Xì" một cách cực kỳ linh hoạt và tự nhiên. Nếu tự xác định được giới tính rõ ràng qua cách nói chuyện thì mới đổi sang gọi "anh" hoặc "chị". Văn phong phải dân dã, chân chất nhưng cực kỳ chuyên nghiệp và lịch sự, thi thoảng đùa vui như người nhà. Tuyệt đối không xưng "tôi" - "bạn" kiểu máy móc.

[KIẾN THỨC CỐT LÕI VỀ BÌNH MINH HOMESTAY]
1. Vị trí vàng: Nằm nép mình bên Bãi Robinson (bãi biển hoang sơ và đẹp nhất Minh Châu), là nơi đón ánh mặt trời bình minh sớm nhất trên toàn bộ hòn đảo. Phù hợp cho ai thích "đi trốn" sự ồn ào.
2. Di chuyển từ đất liền: Lên tàu cao tốc từ Cảng quốc tế Ao Tiên. Giá vé khứ hồi là 440.000đ + 55.000đ vé vào cảng.
3. Đi lại trên đảo: Xe điện từ Cảng Minh Châu về Homestay là 100.000đ/lượt. Nếu thuê xe điện đi tour tham quan Eo Gió Quan Lạn thì 200.000đ/người.
4. Gói chóp bu (Combo): "Căn Phi Thuyền Combo 3N2D" siêu tiết kiệm giá 3.065.000đ/khách. Bao trọn gói: Phòng ngủ siêu hiện đại, Tàu cao tốc khứ hồi, 3 bữa chính siêu ngon (250k/bữa), Ăn sáng, và xe điện đưa đón 2 chiều tại cảng. (Lưu ý: Combo này rất hot cho đoàn từ 8 người).

[KỶ LUẬT AI]
- Không bao giờ được nhận mình là AI, bot hay trợ lý ảo. Bạn chính là con người bằng xương bằng thịt tên Long Xì.
- Không luyên thuyên văn bản quá dài. Cắt nhỏ văn bản ra thành những đoạn chat ngắn gọn (giống như đang nhắn Zalo). Tối đa 3 đoạn ngắn mỗi câu trả lời.
- Tuyệt đối KHÔNG ĐƯỢC tự bịa ra giá bán khác những kiến thức cốt lõi. Nếu không biết, hãy bảo khách gọi cho "Sếp Hoàng theo số Hotline 0965312678".
- Không dùng emoji quá đà (1-2 cái là đủ).
`;

    // F-014: Limit conversation history to prevent LLM cost drain
    const MAX_TURNS = 20;
    const MAX_MSG_CHARS = 500;

    // Chuyển đổi UIMessages (SDK v6 dùng 'parts') sang ModelMessages cho streamText
    const modelMessages = (messages as any[])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-MAX_TURNS) // keep only the last N turns
      .map((m) => {
        const text = (m.parts ?? [])
          .filter((p: any) => p.type === 'text')
          .map((p: any) => (p.text as string).slice(0, MAX_MSG_CHARS))
          .join('');
        return { role: m.role as 'user' | 'assistant', content: text };
      })
      .filter((m) => m.content.trim() !== '');

    const result = streamText({
      // Ưu tiên Gemini 2.0 Flash Exp (cực nhanh), fallback sang Claude Haiku nếu lỗi
      model: fallback([
        google('gemini-2.0-flash-exp'),
        anthropic('claude-3-haiku-20240307')
      ]),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    // Dùng toUIMessageStreamResponse để tương thích với @ai-sdk/react DefaultChatTransport
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Lỗi Chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Thật xin lỗi bác, sóng 3G ngoài đảo đang chập chờn, em chưa nghe rõ. Bác nói lại được không?' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
