(() => {
	// 변수 정리
	let yOffset = 0; // window.pageYOffset 대신 쓸 변수
	let prevScrollHeight = 0;	// 현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들의 스크롤 높이 합
	let currentScene = 0; // 현재 활성화된 섹션
	let enterNewScene = false; // 새로운 scene이 시작되는 순간 true
	let acc = 0.2; // 서서히 감속하게 하는 변수
	let delayedYOffset = 0; // 스크롤 yoffset 지연될 현재 위치
	let rafId;
	let rafState;

	const sceneInfo = [
		{
			//section0 
			type:'sticky', // normal시 스크롤 높이 별도 설정(자신의 컨텐츠 높이만큼)
			heightNum:12, // 스크롤 될 높이 베수 설정 (scrollHeight가 셋팅 배수)
			scrollHeight:0, // 스크롤 높이 초기화 세팅
			objs:{  // 인터렉션 실행될 클래스 변수 설정
				container : document.querySelector('.section0'),
				content : document.querySelector('.section0 .scroll__content'),
				bgImg : document.querySelector('.section0 .scroll__bg'),
				msgA : document.querySelector('.section0 .msgA'),
				msgB : document.querySelector('.section0 .msgB'),
			},
			values:{ // 인터렉션 범위와 시작/종료 구간 설정
				bgImg: [100, 20, {start:0.1, end:0.3}],// [인터렉션 시작, 끝값,{전체 높이(1을 기준으로)의 구간에서 재생 시작, 끝값}]
				circle: [50, 0, {start:0.1, end:0.3}],
				msgA_opacity_in: [0,1, {start:0.1, end:0.25}],
				msgA_opacity_out: [1,0, {start:0.35, end:0.5}], 
				msgA_translateY_in: [20, 0, {start:0.1, end:0.25}],
				msgA_translateY_out: [0, -20, {start:0.35, end:0.5}],
				msgB_opacity_in: [0,1, {start:0.55, end:0.7}], 
				msgB_opacity_out: [1,0, {start:0.8, end:0.9}], 
				msgB_translateY_in: [20, 0, {start:0.55, end:0.7}],
				msgB_translateY_out: [0, -20, {start:0.8, end:0.9}],
			}
		},
		{
			//section1
			type:'normal', 
			heightNum:1,
			scrollHeight:0,
			objs:{ 
				container : document.querySelector('.section1'),
			},
			values:{
			}
		},
	]

 	//애니메이션 처리
	function playAnimation(){
		const objs = sceneInfo[currentScene].objs;
		const values = sceneInfo[currentScene].values;
		const currentYOffset = yOffset - prevScrollHeight; // 현재씬에서 스크롤된 높이
		const scrollHeight = sceneInfo[currentScene].scrollHeight; //현재 섹션의 scrollHeight
		const scrollRatio = currentYOffset / scrollHeight; // 현재씬에서 스크롤된 높이 / 현재 섹션의 scrollHeight
		
		switch(currentScene){
			case 0: //section0

			//spotlight 애니메이션 효과
			if(scrollRatio <= 0){
				objs.bgImg.style.clipPath=`circle(${calcValues(values.bgImg, currentYOffset)}%)`;
			}else{
				objs.bgImg.style.clipPath=`circle(${calcValues(values.bgImg, currentYOffset)}%)`;
			}

			//msgA 애니메이션 효과
			if(scrollRatio <= 0.25){
				//in
				objs.msgA.style.opacity = calcValues(values.msgA_opacity_in, currentYOffset);
				objs.msgA.style.transform = `translate3d(-50%,${calcValues(values.msgA_translateY_in, currentYOffset)}%,0)`;
			}else{
				//out
				objs.msgA.style.opacity = calcValues(values.msgA_opacity_out, currentYOffset);
				objs.msgA.style.transform = `translate3d(-50%,${calcValues(values.msgA_translateY_out, currentYOffset)}%,0)`;
			}
		
			//msgB 애니메이션 효과
			if(scrollRatio <= 0.7){
				//in
				objs.msgB.style.opacity = calcValues(values.msgB_opacity_in, currentYOffset);
				objs.msgB.style.transform = `translate3d(-50%,${calcValues(values.msgB_translateY_in, currentYOffset)}%,0)`;
			}else{
				//out
				objs.msgB.style.opacity = calcValues(values.msgB_opacity_out, currentYOffset);
				objs.msgB.style.transform = `translate3d(-50%,${calcValues(values.msgB_translateY_out, currentYOffset)}%,0)`;
			}
			
			//section1 애니메이션 재생 및 일시정지
			if(scrollRatio >= 1){
				sceneInfo[1].objs.container.classList.add('on');
				sceneInfo[1].objs.container.classList.remove('pause');
			}else{
				sceneInfo[1].objs.container.classList.add('pause');
				sceneInfo[1].objs.container.classList.remove('on');
			}
			break;

			case 1: //section1

			break;
		}
	}


	// 인터렉션 공통 스크립트 부분//

	//layout 세팅
	function setLayout(){
		//각 스크롤 섹션의 높이 세팅
		for(let i=0; i<sceneInfo.length; i++){
			//sceneInfo에서 type에 따라 높이값 설정
			if(sceneInfo[i].type === 'sticky'){
				sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
			} else if(sceneInfo[i].type === 'normal'){
				sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
			}
			sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
		}

		//currentScene(현재 활성화된(눈앞에 보고있는) 섹션) 세팅
		yOffset = window.pageYOffset;
		let totalScrollHeight = 0; // 지나온 섹션들의 스크롤 높이 합
		for(let i=0; i<sceneInfo.length; i++){ 
			// 각 섹션의 scrollHeight를 더해서 넣어줌
			totalScrollHeight += sceneInfo[i].scrollHeight;
			if(totalScrollHeight >= yOffset){ // 현재 스크롤 위치보다 total이 더 커지면 현재 i를 currentScene으로 세팅
				currentScene = i;
				// 현재 스크롤 위치보다 total이 더 커지면 반복문 종료
				break;
			}
		}
		//body에 현재 currentScene 갱신한거 클래스 넣어줌
		document.body.setAttribute('class', `is-show__section${currentScene}`);

		//canvas 크기 조절(화면에 잘 맞게)
		const heightRatio = window.innerHeight / 1080;
	}

	function calcValues(values, currentYOffset){ //css 값을 계산해주는 함수 (sceneInfo의 values 값, 현 섹션에서 얼마나 스크롤 됐는지)
		let rv; //return 해줄 value값을 넣을 변수
		const scrollHeight = sceneInfo[currentScene].scrollHeight; // 현재 섹션 높이
		const scrollRatio = currentYOffset / scrollHeight; // 현재 스크롤 섹션에서 얼마나 스크롤 됐는지 비율 구하기

		//start,end 타이밍에 값이 계산되어 실행할 수 있도록 분기처리
		if(values.length === 3){ // values의 원소 값이 3일 경우(투명도 시작과 끝값, 재생시간 세팅값)
			// start ~ end 사이에 애니메이션 실행 (현재 섹션의 스크롤 높이를 곱한 끝점과 시작점을 빼면 됨)
			const partScrollStart = values[2].start * scrollHeight; // 해당 섹션의 start 시점 계산
			const partScrollEnd = values[2].end * scrollHeight; // 해당 섹션의 end 시점 계산
			const partScrollHeight = partScrollEnd - partScrollStart;	 // 해당 섹션의 애니메이션 구간

			if(currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd ){ // 스크롤이 애니메이션 실행 구간에 들어왔을 경우
				rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0]; //(부분범위) 전체범위에서 현 섹션에서 value 시작점을 빼준 것을 나눠줌

				//(values[1] - values[0]) + values[0]
				// value = [250, 900]으로 가정하면 value[1] - value[0]은 900 - 250이니까 650이 됨, scrollRatio는 0부터 1사이의 값이니까 scrollRatio * 650은 0 ~ 650의 값을 가질 것이고, 거기에 초깃값인 value[0], 즉 250을 더해주면 최종적으로 값의 범위는 250 ~ 900이 되는 것
				//값 자체가 어디부터 어디까지 두개의 값을 가지니깐 + 값 하면 둘 다에게 +

			} else if(currentYOffset < partScrollStart){ // 애니메이션 시작 구간에 스크롤 되지 않았을 때
				rv = values[0];
			} else if(currentYOffset > partScrollEnd){ // 애니메이션이 끝난 후에
				rv = values[1];
			}
		
		}else{
			rv = scrollRatio * (values[1] - values[0]) + values[0]; // (전체범위) 현재 스크롤위치의 비율에 값의 총 범위인 최댓값-최솟값을 곱해주고 스크롤 하지 않은 상태에는 최솟값을 유지해야하기 때문에 마지막에 최솟값을 더해줌 (현 스크롤시 객체의 values값을 잡아주는 계산)
		}
		return rv;
	}

	// 스크롤 하면 실행되는 함수
	function scrollLoop() {
		enterNewScene = false; // false로 기본값 설정
		prevScrollHeight = 0; // 값이 누적이 안되게 초기화 설정

		//prevScrollHeight에 모든 섹션의 scrollHeight를 다 더함 
			//모든 section의 scrollHeight 값
			for (let i = 0; i < currentScene; i++) {
				prevScrollHeight += sceneInfo[i].scrollHeight; 
				// = prevScrollHeight = prevScrollHeight + sceneInfo[i].scrollHeight;
			}
		
		if (delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
		//	document.body.classList.remove('scroll-effect-end');
		}

		if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
			enterNewScene = true; // currentScene이 바뀌는 순간에 true
			if (currentScene === sceneInfo.length - 1) {
			//	document.body.classList.add('scroll-effect-end');
			}
			if (currentScene < sceneInfo.length - 1) {
				currentScene++;
			}
			document.body.setAttribute('class', `is-show__ section${currentScene}`);
		}

		if (delayedYOffset < prevScrollHeight) {
			enterNewScene = true; // currentScene이 바뀌는 순간에 true
			if (currentScene === 0) return; 
			// 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
			currentScene--;
			document.body.setAttribute('class', `is-show__section${currentScene}`);
		}

		if (enterNewScene) return; // enterNewScene이 true일 경우 scrollLoop 함수 종료

		playAnimation();
	}

	function loop() {
		//이동량이 점점 줄어들면서 서서히 감속을 하는 원리
		delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc; //현재 위치 + (목표 위치 - 현재 위치)*0.1 

		//pageYOffset: 목표 위치(현재 스크롤 픽셀값)
		//delayedYOffset: 현재 위치

		if (!enterNewScene) {
			if (currentScene === 0 || currentScene === 2) {
				const currentYOffset = delayedYOffset - prevScrollHeight;
				const objs = sceneInfo[currentScene].objs;
				const values = sceneInfo[currentScene].values;
			}
		}

		// 일부 기기에서 페이지 끝으로 고속 이동하면 body id가 제대로 인식 안되는 경우를 해결
		// 페이지 맨 위로 갈 경우: scrollLoop와 첫 scene의 기본 캔버스 그리기 수행
		if (delayedYOffset < 1) {
				scrollLoop();
		}
		// 페이지 맨 아래로 갈 경우: 마지막 섹션은 스크롤 계산으로 위치 및 크기를 결정해야할 요소들이 많아서 1픽셀을 움직여주는 것으로 해결
		if ((document.body.offsetHeight - window.innerHeight) - delayedYOffset < 1) {
		    let tempYOffset = yOffset;
		    scrollTo(0, tempYOffset - 1);
		}

		rafId = requestAnimationFrame(loop);

		if (Math.abs(yOffset - delayedYOffset) < 1) {
			cancelAnimationFrame(rafId);
			rafState = false;
		}
	}

	window.addEventListener('load', () => {
		setLayout(); // 중간에 새로고침 시, 콘텐츠 양에 따라 높이 계산에 오차가 발생하는 경우를 방지하기 위해 before-load 클래스 제거 전에도 확실하게 높이를 세팅하도록 한번 더 실행

			// 중간에서 새로고침 했을 경우 상단 이동
			let tempYOffset = yOffset;
			let tempScrollCount = 0;
			if (tempYOffset > 0) {
					let siId = setInterval(() => {
							scrollTo(0, 0);
							tempYOffset += 5;

							if (tempScrollCount > 20) {
									clearInterval(siId);
							}
							tempScrollCount++;
					}, 20);
			}
			document.body.classList.remove('before-load');

			setLayout();

       window.addEventListener('scroll', () => {
				yOffset = window.pageYOffset; // 현재 스크롤 위치 확인 가능
				scrollLoop(); // 스크롤 하면 실행되는 함수

  			if (!rafState) {
  				rafId = requestAnimationFrame(loop);
  				rafState = true;
  			}
  		});

  		window.addEventListener('orientationchange', () => {
			scrollTo(0, 0);
			setTimeout(() => {
				window.location.reload();
			}, 500);
  		});
	});
})();


