const express = require('express')
const path = require('path');
const app = express()
const port = 80
var iconv = require('iconv-lite');
const fetch = require('node-fetch'); // node-fetch 라이브러리가 필요합니다.

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// JSON 문자열에서 유효한 JSON 부분만 추출하는 유틸리티 함수
function extractJsonSubstring(text) {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return text.substring(startIndex, endIndex + 1);
    }
    
    // 객체 형태가 아니면 배열 형태를 시도
    const arrayStartIndex = text.indexOf('[');
    const arrayEndIndex = text.lastIndexOf(']');
    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
        return text.substring(arrayStartIndex, arrayEndIndex + 1);
    }

    return null; // 유효한 JSON을 찾지 못하면 null 반환
}

// 루트 경로 ('/')에 대한 GET 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})


app.get('/school', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'school.html'));
})


// 학교 검색 API 요청 처리
app.post('/api/schoolnumber', (req, res) => {
    const data = req.body;

    console.log(`학교 검색: ${data.school}`);

    // iconv-lite를 사용하여 EUC-KR로 인코딩
    const eucKrBuffer = iconv.encode(data.school, 'euc-kr');

    // 버퍼를 16진수 문자열로 변환하고 '%'를 붙이는 함수
    function percentEncodeEucKr(buffer) {
        let result = '';
        for (const byte of buffer) {
            // 각 바이트를 16진수(2자리)로 변환하고 앞에 '%'를 붙임
            result += '%' + byte.toString(16).padStart(2, '0');
        }
        return result;
    }
    
    const encodedString = percentEncodeEucKr(eucKrBuffer);
    console.log(`EUC-KR 퍼센트 인코딩: ${encodedString}`);

    fetch(`http://comci.net:4082/36179?17384l${encodedString}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then((text) => {
        try {
            // 원시 응답 텍스트에서 JSON 부분만 추출
            const jsonSubstring = extractJsonSubstring(text);
            
            if (!jsonSubstring) {
                throw new Error("응답에서 유효한 JSON 부분을 찾을 수 없습니다.");
            }

            const data = JSON.parse(jsonSubstring);
            console.log("성공적으로 파싱된 데이터:", data);
            res.json(data); 
        } catch (error) {
            console.error("JSON 파싱 오류:", error.message);
            console.error("원본 응답 데이터:", text);
            res.status(500).json({ error: "JSON 파싱 오류가 발생했습니다." });
        }
    })
    .catch((error) => {
        console.error("Fetch 요청 오류:", error.message);
        res.status(500).json({ error: "Fetch 요청 중 오류가 발생했습니다." });
    });
})

// 학교 번호 API 요청 처리
app.get('/api/school/:id', (req, res) => {
    // 임시로 하드코딩된 학교 번호. 실제로는 클라이언트 요청에서 받아와야 합니다.
    const schoolnumber = req.params.id; 
    
    // Base64 인코딩
    const base64Encode = Buffer.from(`73629_${schoolnumber}_0_1`).toString('base64');
    console.log(`Base64 인코딩: ${base64Encode}`);

    fetch(`http://comci.net:4082/36179?${base64Encode}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then((text) => {
        try {
            const jsonSubstring = extractJsonSubstring(text);
            
            if (!jsonSubstring) {
                throw new Error("응답에서 유효한 JSON 부분을 찾을 수 없습니다.");
            }

            const data = JSON.parse(jsonSubstring);
            res.json(data);

        } catch (error) {
            console.error("JSON 파싱 오류:", error.message);
            console.error("원본 응답 데이터:", text);
            res.status(500).json({ error: "JSON 파싱 오류가 발생했습니다." });
        }
    })
    .catch((error) => {
        console.error("Fetch 요청 오류:", error.message);
        res.status(500).json({ error: "Fetch 요청 중 오류가 발생했습니다." });
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})