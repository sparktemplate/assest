// ==== Main Match Schedule UI Logic By Sparktemplate ====
function initializeMainScheduleInterface() {
  const mainContainer = document.getElementById('match-schedule-container-new');
  if (!mainContainer) return false;

  const mainLoadingDiv = document.getElementById('loading-matches-main');
  const mainErrorDiv = document.getElementById('error-matches-main');
  const timeZoneNoteDivMain = document.getElementById('time-zone-note-main');
  const tabsContainer = mainContainer.querySelector('.match-day-tabs');

  if (mainLoadingDiv && window.matchSchedulerData && window.matchSchedulerData.icons && window.matchSchedulerData.icons.spinner) {
      mainLoadingDiv.innerHTML = `${window.matchSchedulerData.icons.spinner('match-svg-icon loader-icon')} جاري تحميل البيانات...`;
  } else if (mainLoadingDiv) {
      mainLoadingDiv.innerHTML = `جاري تحميل البيانات...`;
  }

  if (typeof COMPREHENSIVE_WEB_APP_URL === 'undefined' || !COMPREHENSIVE_WEB_APP_URL || !COMPREHENSIVE_WEB_APP_URL.startsWith('https://script.google.com/')) {
    if (mainLoadingDiv) mainLoadingDiv.style.display = 'none';
    if (mainErrorDiv) { mainErrorDiv.textContent = "خطأ: رابط البيانات غير مُعد بشكل صحيح!"; mainErrorDiv.style.display = 'block'; }
    if (tabsContainer) tabsContainer.style.display = 'none';
    return true;
  }

  if (window.matchSchedulerData) {
    window.matchSchedulerData.onReady((allMatches, fetchError) => {
      if (mainLoadingDiv) mainLoadingDiv.style.display = 'none';
      if (timeZoneNoteDivMain && window.matchSchedulerData.getTimeZoneDisplayNote) {
          timeZoneNoteDivMain.innerHTML = window.matchSchedulerData.getTimeZoneDisplayNote();
      }
      if (fetchError) {
        if (mainErrorDiv) { mainErrorDiv.textContent = `خطأ في تحميل بيانات المباريات: ${fetchError}`; mainErrorDiv.style.display = 'block'; }
        if (tabsContainer) tabsContainer.style.display = 'none';
        ['yesterday', 'today', 'tomorrow'].forEach(d => { const s = document.getElementById(`${d}-matches-new`); if(s)s.style.display='none';});
        return;
      }
      if (tabsContainer) tabsContainer.style.display = 'flex';
      switchDayMain('today');
    });
  } else {
    if (mainLoadingDiv) { mainLoadingDiv.textContent = "نظام الجدولة غير مهيأ بعد."; mainLoadingDiv.style.color = "red"; }
  }

  function displayMatchesMain(matches, containerId) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) return;
    const listElement = containerElement.querySelector('.matches-list');
    if (!listElement) return;
    listElement.innerHTML = '';

    if (!matches || matches.length === 0) {
      listElement.innerHTML = '<p class="no-matches-message">لا توجد مباريات مسجلة لهذا اليوم.</p>';
      return;
    }

    matches.forEach(match => {
      const card = document.createElement('div'); card.className = 'match-card';
      if(match.link) card.onclick = () => window.open(match.link, '_blank');

      const topSection = document.createElement('div'); topSection.className = 'match-card-top';

      const teamHome = document.createElement('div'); teamHome.className = 'team team-home';
      const teamHomeName = document.createElement('span'); teamHomeName.className = 'team-name'; teamHomeName.textContent = match.team1 || "الفريق 1";
      if (match.logo1) {
          const logo = document.createElement('img'); logo.className = 'team-logo'; logo.src = match.logo1; logo.alt = match.team1 || "";
          teamHome.appendChild(logo);
      }
      teamHome.appendChild(teamHomeName);

      const centerInfo = document.createElement('div'); centerInfo.className = 'match-center-info';
      const scoreTimeDiv = centerInfo.appendChild(document.createElement('div')); // Changed variable name for clarity
      scoreTimeDiv.className = 'match-score-time';
      const statusDisplay = centerInfo.appendChild(document.createElement('span'));
      statusDisplay.className = 'match-status';
      const currentStatus = match.status ? match.status.toLowerCase().trim() : "لم تبدأ";
      const formattedTime = window.matchSchedulerData.getFormattedTime(match.dateTime);

      if (currentStatus === 'انتهت') {
          if (match.score1 !== null && match.score2 !== null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
              scoreTimeDiv.textContent = `${match.score1} - ${match.score2}`;
          } else { scoreTimeDiv.textContent = '-'; } // Or some other placeholder for finished match with no score
          statusDisplay.textContent = 'انتهت'; statusDisplay.classList.add('status-finished');
      } else if (currentStatus === 'مباشر') {
          if (match.score1 !== null && match.score2 !== null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
              scoreTimeDiv.textContent = `${match.score1} - ${match.score2}`;
          } else { scoreTimeDiv.textContent = formattedTime; } // Show actual time if live and no score
          statusDisplay.textContent = 'مباشر'; statusDisplay.classList.add('status-live');
      } else if (currentStatus === 'مؤجلة') {
          scoreTimeDiv.textContent = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;
          statusDisplay.textContent = 'مؤجلة'; statusDisplay.classList.add('status-postponed');
      } else { // لم تبدأ or other default status
          scoreTimeDiv.textContent = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;
          statusDisplay.textContent = (match.status && currentStatus !== "لم تبدأ") ? match.status : 'لم تبدأ';
          statusDisplay.classList.add(currentStatus === 'لم تبدأ' ? 'status-not-started' : 'status-default');
      }
      // centerInfo.appendChild(scoreTimeDiv); // Already appended
      // centerInfo.appendChild(statusDisplay); // Already appended

      const teamAway = document.createElement('div'); teamAway.className = 'team team-away';
      const teamAwayName = document.createElement('span'); teamAwayName.className = 'team-name'; teamAwayName.textContent = match.team2 || "الفريق 2";
      if (match.logo2) {
          const logo = document.createElement('img'); logo.className = 'team-logo'; logo.src = match.logo2; logo.alt = match.team2 || "";
          teamAway.appendChild(logo);
      }
      teamAway.appendChild(teamAwayName);

      topSection.appendChild(teamHome);
      topSection.appendChild(centerInfo);
      topSection.appendChild(teamAway);
      card.appendChild(topSection);

      const bottomSection = document.createElement('div'); bottomSection.className = 'match-card-bottom';
      const leagueDiv = document.createElement('div'); leagueDiv.className = 'league-info';
      if(match.league && window.matchSchedulerData.icons.trophy) {
         leagueDiv.innerHTML = `${window.matchSchedulerData.icons.trophy('match-svg-icon trophy-icon rtl-before')} ${match.league}`;
      } else if (match.league) { // Fallback if icons not loaded but league exists
         leagueDiv.textContent = match.league;
      } else if (window.matchSchedulerData.icons.trophy) {
         leagueDiv.innerHTML = `${window.matchSchedulerData.icons.trophy('match-svg-icon trophy-icon rtl-before')} غير معروف`;
      }


      const commentatorDiv = document.createElement('div'); commentatorDiv.className = 'commentator-info';
      if (window.matchSchedulerData.icons.microphone) {
          const commentatorName = match.commentator || "غير معروف";
          commentatorDiv.innerHTML = `${window.matchSchedulerData.icons.microphone('match-svg-icon mic-icon rtl-before')} ${commentatorName}`;
      } else if (match.commentator) {
          commentatorDiv.textContent = match.commentator;
      }


      const channelDiv = document.createElement('div'); channelDiv.className = 'channel-info';
      if (window.matchSchedulerData.icons.tv) {
          const channelName = match.channel || "غير معروف";
          channelDiv.innerHTML = `${channelName} ${window.matchSchedulerData.icons.tv('match-svg-icon tv-icon')}`;
      } else if (match.channel) {
          channelDiv.textContent = match.channel;
      }

      bottomSection.appendChild(leagueDiv);
      bottomSection.appendChild(commentatorDiv);
      bottomSection.appendChild(channelDiv);
      card.appendChild(bottomSection);
      listElement.appendChild(card);
    });
}

  function switchDayMain(dayToShow) {
    if (!window.matchSchedulerData || !window.matchSchedulerData.isLoaded) {
      if(mainErrorDiv && !mainErrorDiv.textContent) mainErrorDiv.textContent = "البيانات قيد التحميل أو حدث خطأ.";
      return;
    }
    if(mainErrorDiv) mainErrorDiv.textContent = '';
    const matchesForDay = window.matchSchedulerData.getMatchesForDay(dayToShow);
    displayMatchesMain(matchesForDay, `${dayToShow}-matches-new`);
    ['yesterday', 'today', 'tomorrow'].forEach(d => {
        const section = document.getElementById(`${d}-matches-new`);
        if (section) section.style.display = (d === dayToShow) ? 'block' : 'none';
    });
    activateTabMain(dayToShow);
  }

  function activateTabMain(dayToActivate) {
    const currentTabs = mainContainer.querySelectorAll('.match-day-tab');
    currentTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-day') === dayToActivate) tab.classList.add('active');
    });
  }

  if (tabsContainer) {
    tabsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('match-day-tab')) {
            switchDayMain(event.target.getAttribute('data-day'));
        }
    });
  }
  return true;
}

function attemptInitializeWhenReady() {
    let attempts = 0;
    const maxAttempts = 50; // Approx 10 seconds
    const intervalId = setInterval(() => {
        attempts++;
        if (document.getElementById('match-schedule-container-new') && window.matchSchedulerData) {
            if (initializeMainScheduleInterface()) {
                clearInterval(intervalId);
            }
        } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            console.error("Failed to initialize main schedule interface: Container or matchSchedulerData not found after multiple attempts.");
            const loadingDiv = document.getElementById('loading-matches-main');
            if (loadingDiv) loadingDiv.textContent = "فشل تحميل مكوّن المباريات.";
        }
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInitializeWhenReady);
} else {
    attemptInitializeWhenReady();
}


// ==== Pro Matches Widget UI Logic ====
function initializeProMatchesWidget() {
    const widgetContainer = document.getElementById('pro-matches-widget-container');
    if (!widgetContainer) { console.error("Pro Widget: Container '#pro-matches-widget-container' not found."); return false; }

    const loadingDiv = widgetContainer.querySelector('#p-widget-loading');
    const errorDiv = widgetContainer.querySelector('#p-widget-error');
    const widgetBody = widgetContainer.querySelector('.p-widget-body');
    const scroller = widgetContainer.querySelector('.p-matches-scroller');
    const track = widgetContainer.querySelector('.p-matches-track');
    const prevArrow = widgetContainer.querySelector('.p-scroll-arrow.prev');
    const nextArrow = widgetContainer.querySelector('.p-scroll-arrow.next');
    const dayTabsContainer = widgetContainer.querySelector('.p-widget-day-tabs');
    const allMatchesBtnHeader = widgetContainer.querySelector('.p-widget-all-matches-btn-header');
    const allMatchesBtnMobile = widgetContainer.querySelector('.p-widget-all-matches-btn-mobile');

    const maxMatchesToShow = parseInt(widgetContainer.dataset.maxMatches) || 0;

    let currentCardIndex = 0;
    let cardWidth = 340;
    let cardsToScroll = 1;
    let totalCards = 0;
    const isRTL = widgetContainer.getAttribute('dir') === 'rtl';

    if (loadingDiv && window.matchSchedulerData && typeof window.matchSchedulerData.icons !== 'undefined' && typeof window.matchSchedulerData.icons.spinner === 'function') {
        loadingDiv.innerHTML = `${window.matchSchedulerData.icons.spinner('match-svg-icon loader-icon')} جاري تحميل المباريات...`;
    } else if (loadingDiv) {
        loadingDiv.innerHTML = `جاري تحميل المباريات...`;
    }

    if (typeof window.matchSchedulerData === 'undefined' || typeof window.matchSchedulerData.onReady !== 'function') {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (errorDiv) { errorDiv.textContent = "نظام عرض المباريات الرئيسي غير مهيأ."; errorDiv.style.display = 'block'; }
        return true;
    }

    function calculateDimensionsAndSetCardStyles() {
        if (!scroller || !track) return;

        let defaultCardCssWidth = '340px';
        const cardMargin = 3;
        const arrowButtonWidth = 30;

        if (window.innerWidth <= 767) {
            cardsToScroll = 1;
            const scrollerInnerWidth = scroller.offsetWidth;
            cardWidth = scrollerInnerWidth;
            track.style.marginRight = '0px';
            track.style.marginLeft = '0px';
            track.querySelectorAll('.p-match-card').forEach(card => {
                card.style.width = `${cardWidth > 0 ? cardWidth : defaultCardCssWidth}px`;
                card.style.marginLeft = '0';
                card.style.marginRight = '0';
            });
        } else {
            track.style.marginRight = `${arrowButtonWidth}px`;
            track.style.marginLeft = `${arrowButtonWidth}px`;
            track.querySelectorAll('.p-match-card').forEach(card => {
                card.style.width = defaultCardCssWidth;
                card.style.marginLeft = `${cardMargin}px`;
                card.style.marginRight = `${cardMargin}px`;
            });
            const firstCardEl = track.querySelector('.p-match-card');
            if (firstCardEl) {
                cardWidth = firstCardEl.getBoundingClientRect().width + (cardMargin * 2);
            } else {
                cardWidth = parseInt(defaultCardCssWidth) + (cardMargin * 2);
            }
            const trackVisibleWidth = scroller.offsetWidth - (arrowButtonWidth * 2);
            cardsToScroll = Math.max(1, Math.floor(trackVisibleWidth / cardWidth));
        }
        if (cardsToScroll === 0 && totalCards > 0) cardsToScroll = 1;
    }

    function updateNavigation() {
        if (!prevArrow || !nextArrow || !scroller) return;
        const scrollerVisibleWidth = scroller.offsetWidth;
        const cardsThatCanFit = cardWidth > 0 ? Math.max(1, Math.floor(scrollerVisibleWidth / cardWidth)) : 1;


        if (totalCards <= cardsThatCanFit || totalCards === 0) {
            prevArrow.classList.add('disabled'); nextArrow.classList.add('disabled');
            prevArrow.style.display = 'none'; nextArrow.style.display = 'none';
            return;
        }
        prevArrow.style.display = 'flex'; nextArrow.style.display = 'flex'; // Use flex for centering icon
        prevArrow.classList.toggle('disabled', currentCardIndex === 0);
        nextArrow.classList.toggle('disabled', currentCardIndex >= totalCards - cardsThatCanFit);
    }

    function moveTrackToCurrentCard() {
        if (!track) return;
        let offset = currentCardIndex * cardWidth;
        track.style.transition = 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)';
        track.style.transform = `translateX(${isRTL ? offset : -offset}px)`;
    }

    window.matchSchedulerData.onReady(function(allMatchesData, fetchError) {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (fetchError) {
            if (errorDiv) { errorDiv.textContent = `خطأ: ${fetchError}`; errorDiv.style.display = 'block'; }
            return;
        }
        if (!allMatchesData || typeof window.matchSchedulerData.getMatchesForDay !== 'function') {
            if (errorDiv) { errorDiv.textContent = "بيانات غير متوفرة أو دالة الجلب مفقودة."; errorDiv.style.display = 'block'; }
            return;
        }
        if (widgetBody) widgetBody.style.display = 'block'; // Or 'flex' if it's a flex container
        calculateDimensionsAndSetCardStyles();
        switchDayPro('today');
    });

    function displayProMatches(matches) {
        if (!track) { console.error("Pro Widget: Track element not found in displayProMatches."); return; }
        track.innerHTML = ''; currentCardIndex = 0; totalCards = 0;

        if (!matches || matches.length === 0) {
            track.innerHTML = '<p class="p-no-matches-inline">لا توجد مباريات لهذا اليوم المحدد.</p>';
            calculateDimensionsAndSetCardStyles();
            updateNavigation();
            moveTrackToCurrentCard();
            return;
        }

        let limitedMatches = matches;
        if (maxMatchesToShow > 0 && matches.length > maxMatchesToShow) {
            limitedMatches = matches.slice(0, maxMatchesToShow);
        }
        totalCards = limitedMatches.length;

        limitedMatches.forEach(function(match, index) {
            const card = document.createElement('div');
            card.className = 'p-match-card';
            if (match.link && typeof match.link === 'string' && match.link.trim() !== '') {
                card.classList.add('has-link');
                card.addEventListener('click', () => { window.open(match.link, '_blank'); });
            }

            const leagueName = match.league || 'دوري غير محدد';
            const homeTeamName = match.team1 || 'الفريق المضيف';
            const homeTeamLogo = match.logo1 || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel
            const awayTeamName = match.team2 || 'الفريق الضيف';
            const awayTeamLogo = match.logo2 || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel

            const currentStatus = match.status ? match.status.toLowerCase().trim() : "لم تبدأ";
            const formattedTime = window.matchSchedulerData.getFormattedTime(match.dateTime);

            let scoreTextToDisplay;
            let statusTextForBox;
            let timeInKickoffSlot = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;


            if (currentStatus === 'انتهت') {
                if (match.score1 != null && match.score2 != null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
                    scoreTextToDisplay = `${match.score1} - ${match.score2}`;
                } else {
                    scoreTextToDisplay = '-'; // Or some other placeholder for finished match with no score
                }
                statusTextForBox = 'انتهت';
                timeInKickoffSlot = ''; // Optionally hide time for finished matches or show 'انتهت'
            } else if (currentStatus === 'مباشر') {
                if (match.score1 != null && match.score2 != null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
                    scoreTextToDisplay = `${match.score1} - ${match.score2}`;
                } else {
                    // If live and no score, display the actual time in the score slot
                    scoreTextToDisplay = formattedTime;
                }
                statusTextForBox = 'مباشر';
                // timeInKickoffSlot remains as calculated, showing actual time or '- -' if 00:00
            } else { // "لم تبدأ", "مؤجلة", or other statuses
                // For not started/postponed, score slot shows the time, or '- -' if time is 00:00
                scoreTextToDisplay = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;
                if (currentStatus === 'مؤجلة') {
                    statusTextForBox = 'مؤجلة';
                } else { // "لم تبدأ" or other default status
                    statusTextForBox = (match.status && currentStatus !== "لم تبدأ") ? match.status : 'لم تبدأ';
                }
                // timeInKickoffSlot remains as calculated
            }


            card.innerHTML = `
                <div class="p-match-details">
                    <div class="p-team-display">
                        <img src="${awayTeamLogo}" alt="${awayTeamName}" class="p-team-logo" onerror="this.style.display='none'">
                        <span class="p-team-name">${awayTeamName}</span>
                    </div>
                    <div class="p-match-center-info">
                        <div class="p-match-league">${leagueName}</div>
                        <div class="p-match-score">${scoreTextToDisplay}</div>
                        <div class="p-match-status-box">${statusTextForBox}</div>
                        <div class="p-match-time">${timeInKickoffSlot}</div>
                    </div>
                    <div class="p-team-display">
                        <img src="${homeTeamLogo}" alt="${homeTeamName}" class="p-team-logo" onerror="this.style.display='none'">
                        <span class="p-team-name">${homeTeamName}</span>
                    </div>
                </div>`;
            track.appendChild(card);
        });

        setTimeout(() => {
            calculateDimensionsAndSetCardStyles();
            updateNavigation();
            moveTrackToCurrentCard();
        }, 50); // Delay to allow DOM updates and accurate width calculation
    }

    function switchDayPro(dayToShow) {
        if (typeof window.matchSchedulerData === 'undefined' || !window.matchSchedulerData.isLoaded || typeof window.matchSchedulerData.getMatchesForDay !== 'function') {
            if(errorDiv && errorDiv.style.display === 'none') { errorDiv.textContent = "بيانات الجدولة غير جاهزة."; errorDiv.style.display = 'block';}
            return;
        }
        const matchesForDay = window.matchSchedulerData.getMatchesForDay(dayToShow);
        displayProMatches(matchesForDay);
        if (dayTabsContainer) {
            dayTabsContainer.querySelectorAll('.p-widget-day-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-day') === dayToShow) tab.classList.add('active');
            });
        }
    }

    if (prevArrow && nextArrow && track) {
        prevArrow.addEventListener('click', () => {
            if (prevArrow.classList.contains('disabled')) return;
            currentCardIndex = Math.max(0, currentCardIndex - cardsToScroll);
            moveTrackToCurrentCard(); updateNavigation();
        });
        nextArrow.addEventListener('click', () => {
            if (nextArrow.classList.contains('disabled')) return;
            const scrollerVisibleWidth = scroller.offsetWidth;
            const cardsThatCanFit = cardWidth > 0 ? Math.max(1, Math.floor(scrollerVisibleWidth / cardWidth)) : 1;
            currentCardIndex = Math.min(totalCards - cardsThatCanFit, currentCardIndex + cardsToScroll);
            currentCardIndex = Math.max(0, currentCardIndex);
            moveTrackToCurrentCard(); updateNavigation();
        });
    }

    if (dayTabsContainer) { dayTabsContainer.addEventListener('click', (event) => { if (event.target.classList.contains('p-widget-day-tab')) switchDayPro(event.target.getAttribute('data-day')); }); }

    [allMatchesBtnHeader, allMatchesBtnMobile].forEach(btn => {
        if (btn) { btn.addEventListener('click', (e) => { e.preventDefault(); switchDayPro('today'); });}
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateDimensionsAndSetCardStyles();
            const scrollerVisibleWidth = scroller.offsetWidth;
            const cardsThatCanFit = cardWidth > 0 ? Math.max(1,Math.floor(scrollerVisibleWidth / cardWidth)) : 1;
            currentCardIndex = Math.max(0, Math.min(currentCardIndex, totalCards > 0 ? totalCards - cardsThatCanFit : 0));
            moveTrackToCurrentCard();
            updateNavigation();
        }, 250);
    });

    return true;
}

if (typeof window.proWidgetInitialized === 'undefined') {
    window.proWidgetInitialized = true;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attemptInitializeProWidgetWhenReady);
    else attemptInitializeProWidgetWhenReady();
}

function attemptInitializeProWidgetWhenReady() {
    let attempts = 0; const maxAttempts = 80; const intervalTime = 350;

    const intervalId = setInterval(function() {
        attempts++;
        const widgetContainerExists = document.getElementById('pro-matches-widget-container');
        const schedulerDataExists = typeof window.matchSchedulerData !== 'undefined';
        const schedulerDataReady = schedulerDataExists && window.matchSchedulerData.isLoaded !== false;

        if (widgetContainerExists && schedulerDataReady) {
            if (schedulerDataExists &&
                typeof window.matchSchedulerData.onReady === 'function' &&
                typeof window.matchSchedulerData.getMatchesForDay === 'function') {

                if (initializeProMatchesWidget()) {
                    clearInterval(intervalId);
                }
            } else if (schedulerDataExists && window.matchSchedulerData.isLoaded === true) {
                 console.error("Pro Widget: CRITICAL - matchSchedulerData loaded, but essential functions (onReady or getMatchesForDay) are MISSING.");
                 clearInterval(intervalId);
                 const errorDiv = document.getElementById('p-widget-error');
                 if(errorDiv) { errorDiv.textContent = "خطأ حرج في تهيئة بيانات الجدولة."; errorDiv.style.display = 'block';}
                 const loadingDiv = document.getElementById('p-widget-loading');
                 if (loadingDiv) loadingDiv.style.display = 'none';
            }
        } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            const loadingDiv = document.getElementById('p-widget-loading');
            if (loadingDiv) {
                loadingDiv.textContent = "فشل تحميل الويدجت. حاول التحديث.";
                loadingDiv.style.color = "red";
            }
            const errorDiv = document.getElementById('p-widget-error');
             if(errorDiv) {
                 if (!widgetContainerExists) { errorDiv.textContent = "خطأ: حاوية الويدجت مفقودة."; }
                 else if (!schedulerDataExists) { errorDiv.textContent = "خطأ: نظام البيانات مفقود."; }
                 else { errorDiv.textContent = "خطأ: فشل تحميل البيانات بعد عدة محاولات."; }
                 errorDiv.style.display = 'block';
            }
        }
    }, intervalTime);
}


// ==== Custom League Widgets UI Logic ====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.league-widget-custom').forEach(widgetContainer => {
        initializeSingleLeagueWidget(widgetContainer);
    });
});

function initializeSingleLeagueWidget(widgetContainer) {
    if (!widgetContainer || !window.matchSchedulerData) {
        console.error("Widget or matchSchedulerData not ready for:", widgetContainer ? widgetContainer.id : 'Unknown widget');
        const loadingDivDirect = widgetContainer ? widgetContainer.querySelector('.widget-loading-custom') : null;
        if(loadingDivDirect) loadingDivDirect.textContent = "خطأ في التهيئة.";
        return;
    }

    const config = {
        targetLeague: widgetContainer.dataset.league || "",
        displayOptions: {
            daysRange: parseInt(widgetContainer.dataset.daysRange) || 7,
            period: widgetContainer.dataset.period || 'allInBuffer',
            includeToday: widgetContainer.dataset.includeToday !== 'false'
        },
        showLeagueSelector: widgetContainer.dataset.showLeagueSelector === 'true',
        showMoreButton: widgetContainer.dataset.showMoreButton === 'true',
        matchesPerPage: parseInt(widgetContainer.dataset.matchesPerPage) || 10
    };

    const listDiv = widgetContainer.querySelector('.widget-matches-list-custom');
    const loadingDiv = widgetContainer.querySelector('.widget-loading-custom');
    const titleDiv = widgetContainer.querySelector('.widget-title-custom');
    const timeZoneNoteDiv = widgetContainer.querySelector('.widget-timezone-note-custom');
    const leagueSelectorContainer = widgetContainer.querySelector('.widget-league-selector-container');
    const showMoreContainer = widgetContainer.querySelector('.widget-show-more-container');

    let currentPage = 1;
    let allFilteredMatches = [];
    let currentSelectedLeague = config.targetLeague;

    function updateWidgetTitle() {
        if(titleDiv) {
            let titleText = currentSelectedLeague || "كل الدوريات";
            // You might want to add more context to the title based on period, e.g., "مباريات اليوم لـ..."
            titleDiv.textContent = titleText;
        }
    }

    function renderMatches(matchesToRender) {
        if (!listDiv) return;
        if (currentPage === 1) {
            listDiv.innerHTML = '';
        }
        if (matchesToRender.length === 0 && currentPage === 1) {
            listDiv.innerHTML = '<p class="no-widget-matches-custom">لا توجد مباريات تطابق هذه المعايير.</p>';
            return;
        }

        matchesToRender.forEach(match => {
            const item = document.createElement('div');
            item.className = 'widget-match-item-custom';
            if (match.link) {
                item.style.cursor = 'pointer';
                item.onclick = () => window.open(match.link, '_blank');
            }

            const teamsContainer = document.createElement('div');
            teamsContainer.className = 'teams-container';

            const homeTeamDiv = document.createElement('div');
            homeTeamDiv.className = 'team-display home-team';
            let homeHtml = '';
            if(match.logo1) homeHtml += `<img src="${match.logo1}" alt="${match.team1||''}" class="team-logo-widget" onerror="this.style.display='none'"> `;
            homeHtml += `<span class="team-name-widget">${match.team1||'فريق1'}</span>`;
            homeTeamDiv.innerHTML = homeHtml;

            const awayTeamDiv = document.createElement('div');
            awayTeamDiv.className = 'team-display away-team';
            let awayHtml = '';
            if(match.logo2) awayHtml += `<img src="${match.logo2}" alt="${match.team2||''}" class="team-logo-widget" onerror="this.style.display='none'"> `;
            awayHtml += `<span class="team-name-widget">${match.team2||'فريق2'}</span>`;
            awayTeamDiv.innerHTML = awayHtml;

            const matchCenterDetailsDiv = document.createElement('div');
            matchCenterDetailsDiv.className = 'match-center-details';
            const scoreOrTimeDiv = matchCenterDetailsDiv.appendChild(document.createElement('div'));
            scoreOrTimeDiv.className = 'score-or-time';
            const statusDiv = matchCenterDetailsDiv.appendChild(document.createElement('div'));
            statusDiv.className = 'match-status-widget';
            const dateDiv = matchCenterDetailsDiv.appendChild(document.createElement('div'));
            dateDiv.className = 'match-date-widget';

            const formattedTime = window.matchSchedulerData.getFormattedTime(match.dateTime);
            const formattedDate = window.matchSchedulerData.getFormattedDate(match.dateTime, 'ar-MA', {weekday: 'short', day: 'numeric'}); // Default locale
            let mainDisplayContent = '';
            const matchStatus = match.status ? match.status.toLowerCase().trim() : "لم تبدأ";
            let statusTextToDisplay = match.status || 'لم تبدأ';
            let statusDisplayClass = 'not-started';

            if (matchStatus === 'انتهت') {
                statusTextToDisplay = 'انتهت'; statusDisplayClass = 'finished';
                if (match.score1 != null && match.score2 != null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
                    mainDisplayContent = `${match.score1} - ${match.score2}`;
                } else { mainDisplayContent = '-'; } // Or other placeholder
                dateDiv.style.display = 'none';
            } else if (matchStatus === 'مباشر') {
                statusTextToDisplay = 'مباشر'; statusDisplayClass = 'live';
                if (match.score1 != null && match.score2 != null && match.score1.toString().trim() !== "" && match.score2.toString().trim() !== "") {
                    mainDisplayContent = `${match.score1} - ${match.score2}`;
                } else { mainDisplayContent = formattedTime; } // Show actual time if live and no score
                dateDiv.innerHTML = formattedDate;
            } else if (matchStatus === 'مؤجلة') {
                statusTextToDisplay = 'مؤجلة'; statusDisplayClass = 'postponed';
                mainDisplayContent = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;
                dateDiv.innerHTML = formattedDate;
            } else { // "لم تبدأ" or other default
                statusTextToDisplay = (match.status && matchStatus !== "لم تبدأ") ? match.status : 'لم تبدأ';
                statusDisplayClass = 'not-started';
                mainDisplayContent = (formattedTime === '00:00' || !match.dateTime) ? '-  -' : formattedTime;
                dateDiv.innerHTML = formattedDate;
            }

            scoreOrTimeDiv.textContent = mainDisplayContent;
            statusDiv.textContent = statusTextToDisplay;
            statusDiv.classList.add(statusDisplayClass);

            // Order for RTL: Away Team (Right), Center, Home Team (Left)
            teamsContainer.appendChild(awayTeamDiv);
            teamsContainer.appendChild(matchCenterDetailsDiv);
            teamsContainer.appendChild(homeTeamDiv);

            item.appendChild(teamsContainer);
            listDiv.appendChild(item);
        });
    }

    function loadAndDisplayMatches() {
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (showMoreContainer) showMoreContainer.innerHTML = '';
        allFilteredMatches = window.matchSchedulerData.getLeagueMatchesWithOptions(currentSelectedLeague, config.displayOptions);
        currentPage = 1;
        const matchesForCurrentPage = config.showMoreButton ? allFilteredMatches.slice(0, config.matchesPerPage) : allFilteredMatches;
        renderMatches(matchesForCurrentPage);
        if (loadingDiv) loadingDiv.style.display = 'none';
        updateWidgetTitle();
        if (config.showMoreButton && allFilteredMatches.length > config.matchesPerPage) { // Check if more matches exist beyond the first page
            createShowMoreButton();
        }
    }

    function createShowMoreButton() {
        if (!showMoreContainer) return;
        const moreButton = document.createElement('button');
        moreButton.textContent = 'عرض المزيد';
        moreButton.className = 'widget-show-more-button';
        moreButton.onclick = () => {
            currentPage++;
            const startIndex = (currentPage - 1) * config.matchesPerPage;
            const endIndex = startIndex + config.matchesPerPage;
            const nextPageMatches = allFilteredMatches.slice(startIndex, endIndex);
            renderMatches(nextPageMatches);
            if (endIndex >= allFilteredMatches.length) {
                moreButton.remove();
            }
        };
        showMoreContainer.innerHTML = '';
        showMoreContainer.appendChild(moreButton);
    }

    function createLeagueSelector(availableLeagues) {
        if (!leagueSelectorContainer || !config.showLeagueSelector) return;
        leagueSelectorContainer.innerHTML = '';
        const select = document.createElement('select');
        select.className = 'widget-league-selector-custom';
        const allOption = document.createElement('option');
        allOption.value = ""; allOption.textContent = "كل الدوريات"; select.appendChild(allOption);
        availableLeagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league; option.textContent = league;
            if (league === currentSelectedLeague) option.selected = true;
            select.appendChild(option);
        });
        select.onchange = (e) => { currentSelectedLeague = e.target.value; loadAndDisplayMatches(); };
        leagueSelectorContainer.appendChild(select);
    }

    window.matchSchedulerData.onReady((allMatches, fetchError) => {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (timeZoneNoteDiv && window.matchSchedulerData.getTimeZoneDisplayNote) timeZoneNoteDiv.innerHTML = window.matchSchedulerData.getTimeZoneDisplayNote();
        if (fetchError) { if (listDiv) listDiv.innerHTML = '<p class="no-widget-matches-custom">خطأ في تحميل البيانات.</p>'; return; }
        if (!allMatches && !fetchError) { if (listDiv) listDiv.innerHTML = '<p class="no-widget-matches-custom">لا توجد بيانات مباريات.</p>'; return; }

        if (config.showLeagueSelector && allMatches) {
            const uniqueLeagues = [...new Set(allMatches.map(match => match.league).filter(Boolean))].sort();
            createLeagueSelector(uniqueLeagues);
        }
        loadAndDisplayMatches();
    });
}
