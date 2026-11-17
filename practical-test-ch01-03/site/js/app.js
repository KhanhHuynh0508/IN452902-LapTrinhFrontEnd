// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// a) Hàm formatSeats(event) trả về chuỗi số chỗ ngồi
const formatSeats = (event) => {
    const remaining = event.capacity - event.registeredCount;
    if (remaining <= 0) {
        return "Hết chỗ";
    }
    return `Còn ${remaining}/${event.capacity} chỗ`;
};

// b) Hàm renderEvents(events) tạo card bằng createElement và thay thế nội dung
const renderEvents = (events) => {
    const eventList = document.getElementById('event-list');
    const cardNodes = events.map(event => {
        const article = document.createElement('article');
        article.className = 'event-card';

        const remaining = event.capacity - event.registeredCount;
        if (remaining <= 0) {
            const badge = document.createElement('span');
            badge.className = 'badge-full';
            badge.textContent = 'Hết chỗ';
            article.appendChild(badge);
        }

        const img = document.createElement('img');
        img.setAttribute('src', 'img/event.svg');
        img.setAttribute('alt', event.name);

        const title = document.createElement('a');
        title.setAttribute('href', `event-detail.html?id=${event.id}`);
        title.textContent = event.name;

        const time = document.createElement('time');
        time.setAttribute('datetime', event.startTime);
        time.textContent = formatDateTime(event.startTime);

        const location = document.createElement('p');
        location.textContent = event.location;

        const seats = document.createElement('p');
        seats.textContent = formatSeats(event);

        article.append(img, title, time, location, seats);
        return article;
    });

    eventList.replaceChildren(...cardNodes);
};

// c) Hàm async loadEvents(keyword) gọi API và xử lý trạng thái
const loadEvents = async (keyword = '') => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = "Đang tải...";

    try {
        const params = new URLSearchParams({ pageSize: 50 });
        if (keyword.trim() !== '') {
            params.append('q', keyword.trim());
        }

        const response = await fetch(`${API_URL}/api/events?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Lỗi máy chủ");
        }

        const data = await response.json();
        const items = data.items || [];

        if (items.length === 0) {
            statusEl.textContent = "Không có sự kiện nào khớp từ khóa.";
            document.getElementById('event-list').replaceChildren();
        } else {
            statusEl.textContent = `Tìm thấy ${items.length} sự kiện`;
            renderEvents(items);
        }
    } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error); 
        statusEl.textContent = "Không tải được dữ liệu, vui lòng thử lại.";
        document.getElementById('event-list').replaceChildren();
    }
};

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const keywordInput = document.getElementById('keyword');
    loadEvents(keywordInput.value);
});

loadEvents();