// 이 파일은 사용자의 브라우저가 아닌 Vercel 서버에서 실행됩니다.
// 따라서 브라우저 개발자 도구(F12)로 절대 API 키를 볼 수 없습니다!

export default async function handler(req, res) {
    // 1. POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 프론트엔드(index.html)에서 보낸 프롬프트 받기
    const { prompt } = req.body;
    
    // 3. Vercel 환경 변수에서 구글 Gemini API 키 꺼내기
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API 키가 Vercel 서버에 설정되지 않았습니다.' });
    }

    try {
        // 4. 구글 서버로 안전하게 요청 보내기
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // 5. 분석된 결과만 프론트엔드로 돌려주기 (API 키는 서버에 남음)
        if (resultText) {
            res.status(200).json({ resultText });
        } else {
            throw new Error('데이터 파싱 실패');
        }
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'AI 분석 중 서버 오류가 발생했습니다.' });
    }
}