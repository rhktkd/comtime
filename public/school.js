// school.js

// 1. 전역 변수 정의 (컴시간 JS 코드에서 사용)
let H시간표 = {};
let H학교명단 = {};
let storage = {
    sc: null, // 학교 코드
    r: null,  // 날짜 코드
    ba: "1-1", // 학년-반 (기본값)
    hour: null, // 시간표 데이터 (JSON 문자열)
    Tsc: '' // 임시 학교 코드
};

// `localStorage`에서 데이터를 불러오는 함수
function loadTimetableData(localdata) {
    try {
        const jsonString = localStorage.getItem(localdata);
        if (jsonString) {
            // school.js는 JSON 데이터를 사용하므로 JSON.parse를 사용
            // 학교 이름은 직접 문자열로 가져와서 사용함
            const data = JSON.parse(jsonString);
            console.log('로컬 스토리지에서 데이터 불러오기 성공:', data);
            return data;
        } else {
            console.log('로컬 스토리지에 저장된 데이터가 없습니다.');
            return null;
        }
    } catch (error) {
        console.error('로컬 스토리지에서 데이터를 불러오는 중 오류가 발생했습니다:', error);
        return null;
    }
}

// 학교 이름을 ID로 가져오는 비동기 함수 추가
async function fetchSchoolNameById(schoolId) {
    try {
        // school_ra 함수가 사용하는 것과 동일한 엔드포인트 사용
        const response = await fetch(`./36179?17384l${schoolId}`); 
        const data2 = await response.text();
        const da = data2.substr(0, data2.lastIndexOf('}') + 1);
        const schoolData = JSON.parse(da);

        if (schoolData && schoolData.학교검색 && schoolData.학교검색.length > 0) {
            // 반환된 목록에서 해당 학교 ID에 맞는 이름 찾기
            for (let i = 0; i < schoolData.학교검색.length; i++) {
                if (schoolData.학교검색[i][3] == schoolId) {
                    return schoolData.학교검색[i][2];
                }
            }
        }
        return ''; // 학교를 찾지 못함
    } catch (error) {
        console.error('학교 이름을 불러오는 중 오류가 발생했습니다:', error);
        return '';
    }
}


// api 함수 수정: 초기 로드 시 학교 이름 설정 로직 추가
async function api() {
    // 로컬 스토리지에서 학교 번호 불러오기
    let number = localStorage.getItem('schoolnumber'); // schoolnumber는 JSON이 아닌 일반 문자열일 수 있어 바로 가져옵니다.
    
    if (!number) {
        // schoolnumber가 없으면 timetableData도 확인
        let timetableData = loadTimetableData('timetableData');
        if (timetableData && timetableData.sc) {
            number = timetableData.sc;
        }
    }

    if (!number) {
        // 학교 번호가 없으면 초기 페이지로 리다이렉트
        // 학교 검색 기능을 제거했으므로, 이 상태에서는 로컬 스토리지에 값이 있어야 정상적으로 작동합니다.
        window.location.href = '/';
        return;
    } else {
        // 로컬 스토리지에 학교 번호가 있으면 시간표 열람 화면 표시
        // HTML에서 검색 기능이 제거되었으므로 hidden 클래스도 제거했습니다.
    }
    
    // 로컬 스토리지에 저장된 학교 코드와 날짜 코드 업데이트
    storage.sc = localStorage.getItem('sc') || number; 
    storage.r = localStorage.getItem('r') || 1; 
    storage.ba = localStorage.getItem('ba') || "1-1";

    // 학교 이름이 로컬 스토리지에 없거나 비어있으면 서버에서 가져와 설정
    let storedScnm = localStorage.getItem('scnm');
    if (!storedScnm && storage.sc) {
        const fetchedScnm = await fetchSchoolNameById(storage.sc);
        if (fetchedScnm) {
            document.getElementById('scnm').textContent = fetchedScnm;
            localStorage.setItem('scnm', fetchedScnm); // 로컬 스토리지에 저장
        } else {
            console.warn("학교 이름을 찾을 수 없습니다. 학교 검색을 통해 선택해주세요.");
            // 학교 검색이 제거되었으므로 이 메시지는 출력되지 않습니다.
        }
    } else if (storedScnm) {
        document.getElementById('scnm').textContent = storedScnm;
    }
    
    // 서버에서 시간표 데이터 가져오기
    fetch(`http://localhost:3000/api/school/${storage.sc}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => { 
        console.log("서버에서 받은 시간표 데이터:", data);
        H시간표 = data; // 전역 H시간표 변수에 데이터 할당
        화면구성하기(H시간표.오늘r || 1); // 컴시간 JS의 화면 구성 함수 호출
    })
    .catch(error => console.error('시간표 데이터를 불러오는 중 오류가 발생했습니다:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    api();
});

function school_change() {
    localStorage.removeItem('scnm');
    localStorage.removeItem('schoolnumber');
    window.location.href = '/'
}


function 자료944(자료,학년,반) {
    var p,k,th,분리,sb,속성='',
        원자료,일일자료,강의실='';
        
    if(자료.분리==undefined) {
        분리=100;
    } else {
        분리=자료.분리;
    }
    
    p = "<TABLE  style='width:100%; margin:3px 0px;'>";
    p += "<TR><td class='내용2' style='border:0px; text-align:left;'><input type='button' onClick='ba_NextDisp(-1);' value='◀' class='bg-blue-500 text-black hover:bg-blue-600'></td><TD style='border:0px;' colspan='4' class='내용2'>제 " + 학년 + " 학년 " + 반 + " 반 시간표" + " </TD><td class='내용2'style='border:0px; text-align:right;'><input type='button' onClick='ba_NextDisp(1);' value='▶' class='bg-blue-500 text-black hover:bg-blue-600'></td></TR>";
    p+=요일출력하기(자료.시작일);
    var 시작일=new Date(자료.시작일);
    var 제한일=new Date(자료.열람제한일);
    for(var 교시=1;교시<=8;교시++) {
        p+="<tr><td class='교시'>"+자료.일과시간[교시-1]+"</td>";
        var dt=new Date(자료.시작일);dt.setDate(dt.getDate()-1);
        for(var 요일=1;요일<6;요일++) {
            dt.setDate(dt.getDate()+1);
            if (dt<제한일 || 제한일.getFullYear()<2014 || isNaN(제한일)) {
                원자료=Q자료(자료.자료481[학년][반][요일][교시]);
                일일자료=Q자료(자료.자료147[학년][반][요일][교시]);
                if (자료.강의실==1) {
                    var m3=자료.자료245[학년][반][요일][교시];
                    강의실='';
                    if (m3==undefined) {
                        m3=" ";
                    }if (m3.indexOf('_')>0) {
                        var m2=m3.split('_');
                        var 호수=Number(m2[0]);
                        강의실=m2[1];
                        if(호수>0) {
                            강의실='<br>'+강의실;
                        } else {
                            강의실='';
                        } 
                    }
                }
                if(원자료==일일자료) {
                    속성='내용';
                } else {
                    속성='변경';
                }
                if (일일자료>100) {
                    var 성명="",m2="",tt="";th=mTh(일일자료,분리); 
                    sb=mSb(일일자료,분리);
                    tt=mTime(sb,분리); 
                    sb=sb % 분리;
                    if (th<자료.자료446.length) {
                        성명=자료.자료446[th].substr(0,2);
                    }
                    if (tt=='') { 
                        m2=동시그룹코드(자료,학년,반,sb,요일,교시);
                    } else { 
                        m2=tt; 
                    }
                    p+="<td class='"+속성+"' style='padding:4px 0px 4px 0px;'>"+m2+자료.자료492[sb]+"<br>"+성명+강의실+"</td>";
                }else{
                    p+="<td class='"+속성+"'></td>";
                }
            } else {
                p+="<td class='내용'></td>";
            }
        }
        p+="</tr>";
    }
    p+="</table>";
    return p;
}

function 학년시간표출력(자료,학년,요일) {
    var n, p,분리,k,th,sb,속성='',원자료,일일자료,강의실='';
    var 요일명=['일','월','화','수','목','금','토'];
    var 제한일=new Date(자료.열람제한일);
    var dt=new Date(자료.시작일);
    if(자료.분리==undefined) { 
        분리=100; 
    } else { 
        분리=자료.분리; 
    }
    dt.setDate(dt.getDate()+Number(요일)-1);
    var 요일2=요일명[요일]+"("+dt.getDate()+"일)";
    if(자료.학급수[학년]<=1) { 
        return '';
    }
    var 학급수=요일학급수(학년,요일);
    n=학급수+1-2;
    /* 자료.학급수[학년]+1-2; */
    // 요일선택 드롭다운을 학년시간표출력 함수 내에서 직접 생성하여 반환합니다.
    // 이는 이전에 요일설정하기 함수가 select 요소를 통째로 만들었기 때문입니다.
    var 요일선택HTML = 요일설정하기(자료, 요일); // 이 함수가 <select id='yo'>를 포함한 HTML을 반환합니다.

    p="<TABLE  style='width:100%; margin:3px 0px;'>";
    p+="<TR><td class='내용2'style='border:0px; text-align:left;'><input type='button' onClick='yo_NextDisp(-1);' value='◀' class='bg-blue-500 text-black hover:bg-blue-600'></td><TD style='border:0px;' colspan='"+n+"' class='내용2'>제 "+학년+" 학년 시간표 "+요일2+"</TD><td class='내용2' style='border:0px; text-align:right;'><input type='button' onClick='yo_NextDisp(1);' value='▶' class='bg-blue-500 text-black hover:bg-blue-600'></td></TR>";
    p+=학급출력하기(자료,학년,학급수);
    for(var 교시=1;교시<=8;교시++) {
        p+="<tr><td class='교시'>"+자료.일과시간[교시-1]+"</td>";
        for(var 반=1;반<=학급수;반++) {
            if(dt<제한일 || 제한일.getFullYear()<2014 || isNaN(제한일)) {
                원자료=Q자료(자료.자료481[학년][반][요일][교시]);
                일일자료=Q자료(자료.자료147[학년][반][요일][교시]);
                if(Q자료(자료.강의실)==1) {
                    var m3=자료.자료245[학년][반][요일][교시];
                    강의실='';
                    if(m3==undefined) {
                        m3=" ";
                    }
                    if(m3.indexOf('_')>0){
                        var m2=m3.split('_');
                        var 호수=Number(m2[0]);
                        강의실=m2[1];
                        if(호수>0) {
                            강의실='<br>'+강의실;
                        } else {
                            강의실='';
                        } 
                    }
                }
                if(원자료==일일자료) {
                    if(반==4 || 반==8 || 반==12) {
                        속성='내용3';
                    } else {
                        속성='내용';
                    }
                } else {
                    속성='변경';
                }
                if(일일자료>100) {
                    var 성명="",m2="",tt="";
                    th=mTh(일일자료,분리); 
                    sb=mSb(일일자료,분리);
                    tt=mTime(sb,분리); 
                    sb=sb % 분리;
                    if(th<자료.자료446.length) {
                        성명=자료.자료446[th].substr(0,2);
                    }
                    if(tt=='') { 
                        m2=동시그룹코드(자료,학년,반,sb,요일,교시);
                    } else { 
                        m2=tt; 
                    }
                    p+="<td class='"+속성+"' style='padding:5px 2px 5px 2px;'>"+m2+자료.자료492[sb]+"<br>"+성명+강의실+"</td>";
                } else {
                    p+="<td class='"+속성+"'></td>";
                }
            } else {
                p+="<td class='내용'></td>";
            }
        }
        p+="</tr>";
    }
    p+="</table>";

    // 동적으로 생성된 요일 선택 드롭다운을 시간표 테이블 위에 추가
    // 이 위치에 추가하는 것이 논리적입니다.
    return 요일선택HTML + p; 
}

function 요일학급수(학년,요일){
    for(var 반=H시간표.학급수[학년];반>H시간표.학급수[학년]-H시간표.가상학급수[학년];반--) {
        for(var 교시=1;교시<=8;교시++) {
            if(Q자료(H시간표.자료147[학년][반][요일][교시])>100) { 
                return 반; 
            }
        }
    }
    return H시간표.학급수[학년]-H시간표.가상학급수[학년];
}

function 동시그룹코드(자료,학년,반,과목,요일,교시) {
    var 학급,학년2,반2,과목2,분리,교사,교사2,과목3,과목4,그룹,그룹2,ck,n2;
    if(자료.분리==undefined) { 
        분리=100; 
    } else { 
        분리=자료.분리; 
    }
    if(!Array.isArray(자료.동시그룹)) {
        return '';
    }
    for(var i=1;i<=자료.동시그룹[0][0];i++) {
        for(var k=1;k<=2;k++) {
            ck=0; 
            for(var j=1;j<=자료.동시그룹[i][0];j++) {
                과목4=Math.floor(자료.동시그룹[i][j]/1000);
                그룹2=Math.floor(과목4/1000);
                과목2=과목4-그룹2*1000;
                교사=Math.floor(그룹2/100);
                그룹=그룹2-교사*100;
                학급=자료.동시그룹[i][j]-과목4*1000;
                학년2=Math.floor(학급/100);
                반2=학급-학년2*100;
                과목3=Math.floor(자료.자료147[학년2][반2][요일][교시]/분리);
                교사2=자료.자료147[학년2][반2][요일][교시]-과목3*분리;
                if(k==1) {
                    if(!(과목2==과목3 && 교사==교사2)) { 
                    ck=0; 
                    break; 
                    }
                    if(학년==학년2 && 반==반2 && 과목==과목2 && 교사==교사2 && 그룹>0) { 
                        ck=1; 
                    }
                } else {
                    if(!(과목2==과목3)) { 
                        ck=0; break; 
                    }
                    if(학년==학년2 && 반==반2 && 과목==과목2 && 그룹>0) { 
                    ck=1; 
                    }
                }
            }
            if(ck==1) {
                n2=그룹+64;return String.fromCharCode(n2) + "_";
            }
        }
    }
    return '';
}

function 학급출력하기(자료,학년,학급수){
    var p="<tr><TD class='교시'>교시</td>";
    for(var 반=1;반<=학급수;반++) {
        p+="<TD class='제목'>"+반+"반</td>";
    }
    p+="</TR>";
    return p;
}

function 요일설정하기(자료,요일2){
    var 요일=['월','화','수','목','금','토'],선택;
    var dt=new Date(자료.시작일);
    dt.setDate(dt.getDate()-1);
    var p="<select id='yo' name='yo' onchange='yo_change()' class='p-2 border rounded-md'>";
    p+="<option value='0'>-요일-</option>";
    for(var i=0;i<5;i++) {
        dt.setDate(dt.getDate()+1);
        if(요일2==(i+1)) {
            선택="selected";
        } else {
            선택="";
        }
        p+="<option value='"+(i+1)+"' "+선택+">"+요일[i]+"</option>";
    }
    p+="</select>"; // select 태그 닫기 추가
    return p;
}

function mTh(mm,m2) {
    if(m2==100) { 
        return Math.floor(mm/m2);
    }return mm % m2;
}

function mSb(mm,m2) {
    if(m2==100) { 
        return mm % m2; 
    }
    return Math.floor(mm/m2);
}

function mSb2(mm,m2) {
    if(m2==100) { 
        return mm % m2; 
    }
    return Math.floor(mm/m2);
}

function mTime(mm,m2) {
    var t,n;if(m2==100) { 
        return ''; 
    }
    t=Math.floor(mm/m2);
    if(t>=1 && t<=26) {
        n=t+64;
        return String.fromCharCode(n) + "_";
    }
    return '';
}

function Q자료(m){
    if(m==undefined) { 
        return 0; 
    } else { 
        return m; 
    }
}

function yo_change(){
    const yo_element = document.getElementById('yo');
    const ba_element = document.getElementById('ba');

    if (!yo_element || !ba_element) {
        console.error("Error: 'yo' 또는 'ba' 요소를 찾을 수 없습니다.");
        return;
    }
    
    const selectedDay = yo_element.value;
    const ba_value = ba_element.value;

    // 학급이 선택되지 않았을 경우 (예: placeholder) 오류를 방지합니다.
    if (!ba_value || ba_value === '') {
        console.error("Error: 유효한 학급이 선택되지 않았습니다.");
        return;
    }

    const m2 = ba_value.split('-');
    const 학년 = Number(m2[0]);
    
    // 학년 값이 유효한지 확인합니다.
    if (isNaN(학년) || 학년 <= 0) {
        console.error("Error: 유효하지 않은 학년 값입니다.");
        return;
    }

    $('#hour2').empty().append(학년시간표출력(H시간표, 학년, selectedDay));
}


function yo_NextDisp(방향){
    const m = document.getElementById('yo');
    if (!m) {
        console.error("Error: 'yo' element not found for yo_NextDisp.");
        return;
    }
    let k = m.selectedIndex + 방향;
    const maxIndex = m.length - 1;

    // 인덱스 0은 '요일' placeholder 이므로 무시하고 1부터 시작합니다.
    if(k < 1) {
        k = maxIndex;
    } else if(k > maxIndex) {
        k = 1;
    }

    m[k].selected = true;
    yo_change();
}

function 학급설정하기(학급수,가상학급수){
    var p="<option value=''>-학급-</option>";
    for(var 학년=1;학년<=3;학년++) {
        for(var 반=1;반<=(학급수[학년]-가상학급수[학년]);반++) { 
            p+="<option value='"+학년+"-"+반+"'>"+학년+"-"+반+"</option>";
        }
    }
    return p;
}
function 일자설정하기(일자들,r){
    var p='';
    for(var i=0;i<일자들.length;i++) {
        if(r==일자들[i][0]) {
            p+="<option value='"+일자들[i][0]+"' selected>"+일자들[i][1]+"</option>";
        } else {
            p+="<option value='"+일자들[i][0]+"'>"+일자들[i][1]+"</option>";
        }
    }
    return p;
}

function 요일출력하기(시작일){
    var p="<tr><TD class='교시'>교시</td>";var 요일=['월','화','수','목','금','토'];
    var dt=new Date(시작일);dt.setDate(dt.getDate()-1);
    for(var i=0;i<5;i++) {
        dt.setDate(dt.getDate()+1);
        p+="<TD class='제목'>"+요일[i]+"("+dt.getDate()+")</td>";
    }
    p+="</TR>";
    return p;
}

function ba_change(){
    const m = document.getElementById('ba'); // 요소를 직접 가져옵니다.
    if (!m) {
        console.error("Error: 'ba' element not found for ba_change.");
        return;
    }
    const ba_value = m.value;

    // 학급이 선택되지 않았을 경우 오류를 방지합니다.
    if (!ba_value || ba_value === '') {
        console.error("Error: 유효한 학급이 선택되지 않았습니다.");
        $('#hour').empty();
        $('#hour2').empty();
        return;
    }
    
    const m2 = ba_value.split('-');
    const 학년 = Number(m2[0]);
    const 반 = Number(m2[1]);
    
    // 학년 값이 유효한지 확인합니다.
    if (isNaN(학년) || 학년 <= 0) {
        console.error("Error: 유효하지 않은 학년 값입니다.");
        return;
    }
    
    storage.ba = ba_value;
    $('#hour').empty().append(자료944(H시간표,학년,반));
    학년출력하기(학년);
}

function 학년출력하기(학년){
    let 요일;
    const d = new Date();
    요일 = d.getDay(); // 현재 요일 가져오기 (0:일, 1:월, ..., 6:토)
    if(요일 == 0) 요일 = 1; // 일요일이면 월요일로
    if(요일 == 6) 요일 = 5; // 토요일이면 금요일로 (주중만 표시)

    if(Array.isArray(H시간표.전체학년) == false) {
        H시간표.전체학년 = [1,1,1,1];
    }

    if(H시간표.전체학년[학년] == 1) {
        // 학년시간표출력 함수가 요일 선택 select 박스 (id="yo")를 포함한 HTML을 반환
        $('#hour2').empty().append(학년시간표출력(H시간표, 학년, 요일));

        // 학년시간표출력 후 'yo' 요소가 DOM에 추가되었으므로, 이제 값을 설정할 수 있습니다.
        const elem = document.getElementById('yo');
        if (elem) { // 요소가 존재하는지 다시 확인
            elem.value = 요일; // 초기 요일 값 설정
        }
    } else {
        $('#hour2').empty();
    }
}

function ba_NextDisp(방향){
    const m = document.getElementById('ba');
    if (!m) {
        console.error("Error: 'ba' element not found for ba_NextDisp.");
        return;
    }
    let k = m.selectedIndex + 방향;
    const maxIndex = m.length - 1;
    
    // 인덱스 0은 placeholder 이므로 1부터 시작합니다.
    if(k < 1) {
        k = maxIndex;
    } else if(k > maxIndex) {
        k = 1;
    }
    m[k].selected = true;
    ba_change();
}

function new_change(){
    api();
}

function nal_change(){
    var r=document.getElementById('nal').value;
    sc_data('73629_',storage.sc,r,'0');
}

function 화면구성하기(r) {
    var r2;
    if(r>0) {
        r2=r;
    } else {
        r2=H시간표.오늘r;
    }
    $('#nal').empty().append(일자설정하기(H시간표.일자자료,r2));
    $('#ba').empty().append(학급설정하기(H시간표.학급수,H시간표.가상학급수));
    var 학년=1,반=1;var m=storage.ba.split('-');
    if(m.length==2) {학년=Number(m[0]);반=Number(m[1]);
        if(학년<=0 || 학년>3) 학년=1;
        if(반>H시간표.학급수[학년]) 반=1;
    }
    var ma=document.getElementById('ba');
    // ma가 null일 경우를 대비한 방어 코드 추가
    if (ma) {
        ma.value=(학년+'-'+반);
    } else {
        console.error("Error: 'ba' element not found in 화면구성하기.");
    }
    $('#hour').empty().append(자료944(H시간표,학년,반));
    $('#수정일').text('수정일: '+H시간표.자료244);
    학년출력하기(학년);
    /*H시간표.컴시간='<p>안드로이드폰은 [구글Play스토어]에서 컴시간알리미앱을 설치하세요.<p>아이폰은 [앱스토어]에서 컴시간알리미앱을 설치하세요.';*/
    컴시간_메세지출력();
    학교_메세지출력();
}

function 컴시간_메세지출력() {
    if(H시간표.컴시간==undefined) {
        $('#mesg').empty();
    } else {
        var p="<TABLE style='width:100%; padding:1px; border:1px lightgrey solid; margin: 1px 0px;'>";
        p+="<TR style='height:8px;'><TD style='border:1px lightgrey; text-align:center; font-size:10pt; font-weight:bold;' class='내용4'>컴시간 전달사항</TD></tr><tr  style='height:100px;'><TD style='border:0px; text-align:left;' class='내용'>"+H시간표.컴시간+"</TD></td></TR></table>";
        $('#mesg').empty().append(p);
    }
}

function 컴시간_메세지출력2() {
    var p="<TABLE style='width:100%; padding:1px; border:1px lightgrey solid; margin: 1px 0px;'>";
    p+="<tr class='검색'><td colspan=2 style='height:40pt; text-align:left;line-height:180%;'>&nbsp;&nbsp;매번 학교검색을 하는 경우는 <br>&nbsp;&nbsp;<span style='font-size:11pt'><strong>[ <a href=http://comci.net:4082/st target=_blank>http://comci.net:4082/st</a> ]</strong></span>로 접속하고 즐겨찾기하세요.</td></tr></table>";
    $('#mesg3').empty().append(p);
}
function 학교_메세지출력() {
    if(H시간표.학교전달==undefined) {
        $('#mesg2').empty();
    } else {
        var p="<TABLE style='width:100%; padding:1px; border:1px lightgrey solid; margin: 1px 0px;'>";
        p+="<TR style='height:8px;'><TD style='border:1px lightgrey; text-align:center; font-size:10pt; font-weight:bold;' class='내용4'>학교 전달사항</TD></tr><tr  style='height:100px;'><TD style='border:0px; text-align:left;' class='내용'>"+H시간표.학교전달+"</TD></td></TR></table>";
        $('#mesg2').empty().append(p);
    }
}
