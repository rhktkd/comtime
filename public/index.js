const loginForm = document.getElementById('schoolform');
const schoolContainer = document.getElementById('school');


if (!loginForm) {
    console.error("Error: 'schoolForm' ID를 가진 폼 요소를 찾을 수 없습니다.");
} else {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const schoolInput = document.getElementById('schoolinput');
        if (!schoolInput) {
            console.error("Error: 'schoolinput' ID를 가진 입력 필드를 찾을 수 없습니다.");
            return;
        }

        const school = str = schoolInput.value.replace(/\s/g, "");;
        console.log('학교 검색:', school);

        const data = { school };

        // 이후 서버 ip로 수정
        fetch('http://localhost:3000/api/schoolnumber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data) 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json();
            })
            .then(result => {
                console.log('서버로부터 받은 데이터:', result);
                schoolContainer.innerHTML = '';

                if (result.학교검색 && Array.isArray(result.학교검색) && result.학교검색.length > 0) {
                    schoolContainer.innerHTML = '<hr class="my-4">'
                    result.학교검색.forEach(schoolInfo => {
                        const schoolName = schoolInfo[2];
                        const schoolNumber = schoolInfo[3];
                        
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
                console.error('요청 중 문제가 발생했습니다:', error);
            });
    });
}

function api(number, scnm) {
    try {
      localStorage.setItem('sc', number);
      localStorage.setItem('scnm', scnm);
      
      console.log('시간표 데이터가 로컬 스토리지에 성공적으로 저장되었습니다.');
      window.location.href = '/school'
    } catch (error) {
      console.error('로컬 스토리지에 데이터를 저장하는 중 오류가 발생했습니다:', error);
       schoolContainer.innerHTML = '<p>오류가 발생하였습니다.</p><p> 다시 시도 하여 주십시오.</p>'
    }
}
