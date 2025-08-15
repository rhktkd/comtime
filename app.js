// itty-router를 사용하여 Express의 라우팅 기능을 대체합니다.
// Workers 환경에서는 npm 패키지를 직접 import할 수 없으므로,
// Workers에 맞는 라이브러리를 사용하거나 직접 코드를 포함해야 합니다.
// Cloudflare Workers에서는 'itty-router'를 공식적으로 권장합니다.
// 이 코드는 'itty-router' 라이브러리가 존재한다고 가정하고 작성되었습니다.
// 실제 배포 시에는 'wrangler.toml'에 필요한 패키지를 명시하거나
// Hono와 같은 대체 라이브러리를 사용할 수 있습니다.

// Itty-router의 Router 클래스를 가져옵니다.
import { Router } from 'itty-router';

// 라우터 인스턴스 생성
const router = Router();

// JSON 문자열에서 유효한 JSON 부분만 추출하는 유틸리티 함수
// 이 함수는 Node.js 코드의 로직을 그대로 유지했습니다.
function extractJsonSubstring(text) {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return text.substring(startIndex, endIndex + 1);
    }
    
    const arrayStartIndex = text.indexOf('[');
    const arrayEndIndex = text.lastIndexOf(']');
    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
        return text.substring(arrayStartIndex, arrayEndIndex + 1);
    }

    return null;
}

// EUC-KR 인코딩 및 퍼센트 인코딩 함수
// iconv-lite 대신 Workers 환경에서 직접 구현합니다.
function percentEncodeEucKr(text) {
    const encoder = new TextEncoder('euc-kr');
    const encoded = encoder.encode(text);
    let result = '';
    for (const byte of encoded) {
        result += '%' + byte.toString(16).padStart(2, '0').toUpperCase();
    }
    return result;
}

// Base64 인코딩 함수
// Node.js의 Buffer를 대체합니다. Workers 환경의 fetch에는 Buffer가 내장되어 있습니다.
function base64Encode(str) {
    return btoa(str);
}


// '/api/schoolnumber'에 대한 POST 요청 처리
router.post('/api/schoolnumber', async (request) => {
    // Cloudflare Workers에서는 express.json()이 없으므로,
    // request.json()을 사용해 요청 본문을 파싱합니다.
    const data = await request.json();

    const encodedString = percentEncodeEucKr(data.school);
    console.log(`EUC-KR 퍼센트 인코딩: ${encodedString}`);

    try {
        const response = await fetch(`http://comci.net:4082/36179?17384l${encodedString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const jsonSubstring = extractJsonSubstring(text);
        
        if (!jsonSubstring) {
            throw new Error("응답에서 유효한 JSON 부분을 찾을 수 없습니다.");
        }

        const jsonData = JSON.parse(jsonSubstring);
        console.log("성공적으로 파싱된 데이터:", jsonData);
        return new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error("Fetch 요청 또는 JSON 파싱 오류:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});


// '/api/school/:id'에 대한 GET 요청 처리
router.get('/api/school/:id', async (request) => {
    // itty-router는 URL 매개변수를 request.params로 전달합니다.
    const schoolnumber = request.params.id;

    const base64Str = base64Encode(`73629_${schoolnumber}_0_1`);
    console.log(`Base64 인코딩: ${base64Str}`);

    try {
        const response = await fetch(`http://comci.net:4082/36179?${base64Str}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const jsonSubstring = extractJsonSubstring(text);

        if (!jsonSubstring) {
            throw new Error("응답에서 유효한 JSON 부분을 찾을 수 없습니다.");
        }

        const jsonData = JSON.parse(jsonSubstring);
        return new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error("Fetch 요청 또는 JSON 파싱 오류:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});


// 나머지 모든 요청에 대한 라우팅
// Cloudflare Pages는 정적 파일을 자동으로 처리하므로,
// Workers 스크립트에서 HTML 파일을 제공할 필요가 없습니다.
// 이 라우터는 API 요청만 처리하도록 설계되었습니다.
// 나머지 모든 요청에 대해 'itty-router'는 404 Not Found를 반환합니다.
// 이 로직은 정적 파일이 Cloudflare Pages에 의해 서빙된다는 가정하에 작동합니다.


// Workers의 이벤트 리스너
// 이 리스너는 모든 인바운드 요청을 가로채 라우터에 전달합니다.
export default {
    fetch: router.handle
};
