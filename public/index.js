// 1. 폼 요소를 안전하게 가져옵니다.
const loginForm = document.getElementById('schoolform');
const schoolContainer = document.getElementById('school');


if (!loginForm) {
    console.error("Error: 'schoolForm' ID를 가진 폼 요소를 찾을 수 없습니다.");
} else {
    // 2. 이벤트 리스너 추가
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 3. 입력 필드 가져오기
        const schoolInput = document.getElementById('schoolinput');
        if (!schoolInput) {
            console.error("Error: 'schoolinput' ID를 가진 입력 필드를 찾을 수 없습니다.");
            return;
        }

        const school = schoolInput.value;
        console.log('학교 검색:', school);

        const data = { school };

        // 4. 서버로 데이터 전송
        //fetch('https://port-0-comtime-me10tmyt8817a068.sel5.cloudtype.app/api/schoolnumber', {
        fetch('http://localhost:3000/api/schoolnumber', {
            method: 'POST', // HTTP 요청 메서드
            headers: {
                'Content-Type': 'application/json' // 데이터 형식이 JSON임을 명시
            },
            // 자바스크립트 객체를 JSON 문자열로 변환하여 body에 담음
            body: JSON.stringify(data) 
            })
            .then(response => {
                // 서버로부터의 응답을 JSON 형식으로 파싱
                if (!response.ok) {
                    throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json();
            })
            .then(result => {
                // 서버로부터 받은 JSON 데이터 처리
                console.log('서버로부터 받은 데이터:', result);
                schoolContainer.innerHTML = ''; // 기존 내용을 초기화

                // 응답 데이터에 '학교검색' 배열이 있는지 확인
                if (result.학교검색 && Array.isArray(result.학교검색) && result.학교검색.length > 0) {
                    schoolContainer.innerHTML = '<hr class="my-4">'
                    // 각 학교에 대한 버튼을 생성
                    result.학교검색.forEach(schoolInfo => {
                        const schoolName = schoolInfo[2];
                        const schoolNumber = schoolInfo[3];
                        
                        // '알림' 메시지는 버튼으로 만들지 않음
                        if (schoolName !== '없으면 추가 검색하세요') {
                            const buttonHtml = `<button type='button' class="btn btn-outline-secondary w-100 mb-2" onclick='api(${schoolNumber}, "${schoolName}")'>${schoolName}</button>`;
                            schoolContainer.innerHTML += buttonHtml;
                        }
                    });
                } else {
                    schoolContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
                }
            })
            .catch(error => {
                // 에러 발생 시 처리
                console.error('요청 중 문제가 발생했습니다:', error);
            });
    });
}

function api(number, scnm) {
    try {
      // 2. 'timetableData'라는 키로 로컬 스토리지에 저장
      localStorage.setItem('schoolnumber', number);
      localStorage.setItem('schoolname', scnm);
      
      console.log('시간표 데이터가 로컬 스토리지에 성공적으로 저장되었습니다.');
      window.location.href = '/school'
    } catch (error) {
      console.error('로컬 스토리지에 데이터를 저장하는 중 오류가 발생했습니다:', error);
       schoolContainer.innerHTML = '<p>오류가 발생하였습니다.</p><p> 다시 시도 하여 주십시오.</p>'
    }
}
