# 🥗 NUTRIFUTURE – Ứng dụng Học tập & Thực hành Dinh dưỡng Học sinh THPT

> **Dành riêng cho học sinh trường THCS & THPT Ngã Sáu (Độ tuổi 15–22)**  
> Ứng dụng web trực quan, chuyên nghiệp, thông minh, tối ưu hóa 100% để triển khai tĩnh trên **GitHub Pages (`github.io`)**.

---

## 🌟 Giới thiệu 6 Tính năng cốt lõi trên Thanh điều hướng

### 👤 Tính năng 1: Khởi tạo Hồ sơ & Cảnh báo Dị ứng
- **Màn hình đầu tiên khi vào ứng dụng:** Bảng hồ sơ học sinh gồm: *Họ và tên, Tuổi (15–22), Giới tính, Chiều cao (cm), Cân nặng (kg), Mức độ vận động (Ít vận động, Nhẹ, Vừa phải, Năng động)*.
- **Hồ sơ dị ứng thông minh:** Học sinh chọn các thành phần gây dị ứng (Đậu phộng, Hải sản, Tôm, Cua, Mực/Ốc, Cá biển, Trứng, Sữa/Lactose, Gluten/Bột mì, Đậu nành, Mắm tôm/ruốc...) hoặc nhập tùy chỉnh.
- **Kết quả tính toán thời gian thực:**
  - **Chỉ số BMI (Body Mass Index)** theo chuẩn IDI & WPRO dành riêng cho người châu Á (*Gầy, Bình thường, Thừa cân, Béo phì*).
  - **Nhu cầu Calo cần thiết mỗi ngày (TDEE)** theo công thức Mifflin-St Jeor chuẩn hóa.
  - **Lượng nước cần uống mỗi ngày (Lít & số ly nước 250ml)** theo công thức khoa học $35\text{ ml/kg}$.
  - *Ví dụ mẫu đề bài:* Nam, 17 tuổi, cao 170cm, nặng 60kg $\rightarrow$ BMI 20.8 (Bình thường), cần 2.200 kcal/ngày, uống 2.1 lít nước/ngày (~8–9 ly).

---

### 🔍 Tính năng 2: Tra cứu Dinh dưỡng Thông minh
- **Cơ sở dữ liệu chuẩn hóa 202 món ăn Việt Nam** từ 3 miền Bắc – Trung – Nam và đặc sản từng tỉnh/thành phố:
  - **Miền Bắc (69 món):** Phở bò tái, Phở bò chín, Bún chả Hà Nội, Bánh đa cua Hải Phòng, Chả cá Lã Vọng, Nem rán, Bún đậu mắm tôm, Bánh cốm...
  - **Miền Trung (59 món):** Bún bò Huế, Mì Quảng, Cao lầu Hội An, Bánh bèo, Bánh nậm, Bánh bột lọc, Bún sứa, Cơm gà Hội An, Kẹo cu đơ, Mè xửng...
  - **Miền Nam (74 món):** Cơm tấm sườn bì chả, Hủ tiếu Nam Vang, Bún mắm miền Tây (Ngã Sáu), Bánh xèo miền Tây, Lẩu mắm, Canh chua cá, Bánh pía Sóc Trăng, Kẹo dừa Bến Tre...
- **Tùy chọn Khẩu phần (Size S, M, L):**
  - **Size S = 70%** khẩu phần chuẩn.
  - **Size M = 100%** khẩu phần chuẩn.
  - **Size L = 130%** khẩu phần chuẩn.
  - *Khi người dùng bấm vào size nào, hệ thống tự động tính toán lại lượng calo, chất đạm (protein), chất béo (fat), carbohydrate dựa trên tỷ lệ phần trăm và cập nhật con số tức thì trên màn hình.*
- **Cảnh báo Dị ứng (Red Alert):**
  - Hệ thống tự động đối chiếu thành phần món ăn với hồ sơ dị ứng đã lưu của học sinh. Nếu món chứa dị nguyên, ứng dụng hiển thị cảnh báo đỏ nhấp nháy ngay lập tức (Ví dụ: `🚨 Cảnh báo: Món này có chứa đậu phộng!`).

---

### 📸 Tính năng 3: Nhận diện Thực phẩm bằng AI (Camera)
- **Thao tác nhanh gọn:** Khung ngắm Camera trực tiếp với nút **"Chụp ảnh ngay"** nằm cạnh nút **"Thêm hình ảnh"** (tải ảnh từ máy tính/điện thoại).
- **Thanh điều chỉnh định lượng thực tế:** Nút bấm **Ít (70%) – Vừa (100%) – Nhiều (130%)** giúp học sinh hiệu chỉnh khối lượng thịt/rau, khắc phục hạn chế AI không thể cân đo chính xác khối lượng thực tế.
- **Cảnh báo kép (Dual Warning):** Tự động đối chiếu món ăn nhận diện được với hồ sơ dị ứng của học sinh. Nếu có dị nguyên, phát cảnh báo `Red Alert` rung lắc trực quan.
- **Kết quả hiển thị:** Tên món nhận diện + Tên tỉnh/thành phố đặc sản + 4 nhóm chất dinh dưỡng chi tiết + Nút "Lưu vào nhật ký hôm nay".
- **Tích hợp Google Gemini AI:** Hỗ trợ các model tốc độ cao, siêu nhẹ và ít tốn quota nhất như `gemini-1.5-flash`, `gemini-2.0-flash`. Đồng thời tích hợp chế độ giả lập ngoại tuyến thông minh đảm bảo trang web luôn hoạt động ngay cả khi chưa có API key.

---

### 🍱 Tính năng 4: Gợi ý & Xây dựng Thực đơn Khoa học
- **Cân đối 3 bữa chính:** Phân bổ tỷ lệ chuẩn:
  - **Bữa sáng:** ~30% Calo mục tiêu.
  - **Bữa trưa:** ~40% Calo mục tiêu.
  - **Bữa tối:** ~30% Calo mục tiêu.
- **Đảm bảo 4 nhóm chất:** Bột đường, chất đạm, chất béo, vitamin & khoáng chất, luôn có sự đồng hành của rau xanh và trái cây tươi.
- **Tính năng mở rộng:**
  - Nút **"Đổi thực đơn khác"** tự động xáo trộn và tạo tổ hợp thực đơn cân bằng mới từ 202 món ăn.
  - Nút **"Áp vào Nhật ký"** chuyển nhanh toàn bộ thực đơn vào nhật ký trong ngày.

---

### 📊 Tính năng 5: Nhật ký Dinh dưỡng & Theo dõi
- **Ghi nhận món ăn:** Phân loại theo 4 bữa: *Bữa sáng, Bữa trưa, Bữa tối, Ăn vặt & Tráng miệng*.
- **Biểu đồ vòng tròn (Donut Chart SVG):** Trực quan hóa tỷ lệ phần trăm Calo đã nạp so với mục tiêu trong ngày.
- **Phân tách 3 nhóm đa lượng:** Đo lường chính xác lượng chất đạm, chất béo, carbohydrate kèm thanh tiến độ.
- **Lời khuyên thông minh tự động (Smart Automated Advice):** Phân tích khẩu phần thực tế để nhắc nhở học sinh (Ví dụ: *"Hôm nay bạn thiếu chất xơ, hãy bổ sung thêm rau xanh!"*, *"Lượng đạm rất chuẩn tốt cho cơ bắp!"*).
- **Theo dõi lượng nước uống:** Lưới các ly nước 250ml tương tác trực quan, chạm để đánh dấu ly nước đã uống.
- **Sao lưu & Khôi phục dữ liệu JSON:**
  - Nút **"📥 Xuất JSON"**: Tải file sao lưu dữ liệu toàn diện về máy.
  - Nút **"📤 Nhập JSON"**: Khôi phục lại toàn bộ dữ liệu nhật ký và hồ sơ bất cứ lúc nào.

---

### 🎮 Tính năng 6: Gamification – Học mà chơi
- **Điểm thưởng (XP) & Thăng cấp:** Cộng điểm khi đăng nhập, tra cứu món, quét AI, ghi nhật ký, hoàn thành nhiệm vụ.
- **Chuỗi ngày (Streak 🔥):** Theo dõi số ngày liên tục mở app để duy trì thói quen ăn uống lành mạnh.
- **Câu đố AI (5 câu hỏi ngẫu nhiên mỗi ngày):** Bộ câu hỏi trắc nghiệm tăng dần độ khó từ Dễ đến Khó, làm đúng cộng +20 XP/câu kèm lời giải thích khoa học chi tiết.
- **Bộ sưu tập Huy hiệu (Badges):** Mở khóa huy hiệu thành tích: *Người mới, Ăn uống lành mạnh, 7 ngày liên tục, Uống đủ nước, Bậc thầy 3 miền, Nhà thông thái AI*.
- **Đổi điểm mở khóa Giao diện (Themes):** Học sinh dùng điểm thưởng để đổi giao diện theo sở thích:
  - 🌿 *Xanh Tươi Mát (Mặc định)*
  - 🍊 *Cam Năng Động (Citrus)*
  - 🌊 *Đại Dương (Ocean)*
  - 🌌 *Tím Galaxy*
- **Thử thách tuần:** Nhiệm vụ thực tế kèm thanh tiến độ trực quan: *"Ăn 5 loại rau củ khác nhau"*, *"Uống đủ nước 3 ngày"*, *"Không uống nước ngọt 2 ngày"*, *"Hoàn thành 3 bài Quiz"*.

---

## 🚀 Hướng dẫn Triển khai trên GitHub Pages (github.io)

Ứng dụng được viết theo chuẩn **Client-side Static Web Application** thuần khiết (HTML5, Tailwind CSS qua CDN, Vanilla JS mô-đun hóa, không cần Node.js build server), cực kỳ tương thích với GitHub Pages:

1. **Khởi tạo repository trên GitHub:**
   - Tạo repo mới trên GitHub (Ví dụ: `nutrifuture`).
2. **Đẩy mã nguồn lên nhánh chính (`main`):**
   ```bash
   git add .
   git commit -m "Deploy NUTRIFUTURE web app"
   git push origin main
   ```
3. **Kích hoạt GitHub Pages:**
   - Vào mục **Settings** $\rightarrow$ **Pages** của Repository.
   - Tại mục **Build and deployment** $\rightarrow$ **Source**, chọn **Deploy from a branch**.
   - Chọn nhánh `main` và thư mục `/ (root)`, nhấn **Save**.
   - Sau 1–2 phút, trang web của bạn sẽ hoạt động tại địa chỉ:  
     `https://<ten-tai-khoan-github>.github.io/<ten-repo>/`

---

## 🔑 Hướng dẫn lấy khóa Google Gemini API miễn phí trong 30 giây

1. Truy cập vào trang quản lý API miễn phí của Google: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google (Gmail) của bạn.
3. Nhấn vào nút **"Create API Key"** (Tạo khóa API) $\rightarrow$ Chọn một project bất kỳ và sao chép chuỗi khóa (bắt đầu bằng `AIzaSy...`).
4. Mở ứng dụng **NUTRIFUTURE** $\rightarrow$ Nhấn nút **"✨ Gemini AI"** ở góc trên cùng bên phải thanh điều hướng.
5. Dán khóa API vào ô nhập và nhấn **"Kiểm tra & Lưu"**. Khóa sẽ được lưu an toàn trực tiếp trên trình duyệt của bạn (LocalStorage) và không bị rò rỉ ra ngoài!

---
*© 2026 NUTRIFUTURE – Trường THCS & THPT Ngã Sáu. Vì tầm vóc và trí tuệ tương lai học đường!*
