/**
 * NUTRIFUTURE - BỘ CÂU HỎI TRẮC NGHIỆM DINH DƯỠNG THPT (THCS & THPT NGÃ SÁU)
 * Phân cấp độ: Dễ - Trung bình - Khó
 * Hỗ trợ tạo 5 câu hỏi ngẫu nhiên tăng dần độ khó mỗi ngày
 */

const NUTRITION_QUIZ_BANK = [
  // --- CẤP ĐỘ DỄ (Kiến thức cơ bản, thói quen ăn uống) ---
  {
    id: 1,
    difficulty: "Dễ",
    level: 1,
    question: "4 nhóm chất dinh dưỡng thiết yếu cần có trong bữa ăn hàng ngày của học sinh là gì?",
    options: [
      "Chất đạm (Protein), Bột đường (Carb), Chất béo (Fat), Vitamin & Khoáng chất",
      "Chất xơ, Chất béo bão hòa, Canxi, Đường tinh luyện",
      "Thịt bò, Cá hồi, Trứng gà, Sữa chua",
      "Cơm trắng, Bánh ngọt, Nước ngọt có ga, Trái cây"
    ],
    answer: 0,
    explanation: "Một bữa ăn khoa học phải cân đối đầy đủ 4 nhóm chất: Bột đường (cung cấp năng lượng), Chất đạm (xây dựng tế bào/cơ bắp), Chất béo (hòa tan vitamin, bổ não) và Vitamin - Khoáng chất (tăng đề kháng)."
  },
  {
    id: 2,
    difficulty: "Dễ",
    level: 1,
    question: "Lượng nước khuyến nghị tối thiểu cho học sinh THPT mỗi ngày là bao nhiêu?",
    options: [
      "Khoảng 0.5 lít (chỉ khi nào thấy khát mới uống)",
      "Khoảng 1.8 – 2.5 lít (tương đương 7 – 9 ly nước 250ml)",
      "Càng nhiều càng tốt, trên 6 lít mỗi ngày",
      "Uống nước ngọt thay cho nước lọc"
    ],
    answer: 1,
    explanation: "Công thức chuẩn khoa học là 35 - 40ml nước / kg thể trọng. Học sinh 50-65kg cần khoảng 1.8 - 2.5 lít nước/ngày để duy trì tuần hoàn máu, hỗ trợ bài tiết và giữ não bộ tỉnh táo học tập."
  },
  {
    id: 3,
    difficulty: "Dễ",
    level: 1,
    question: "Nhóm thực phẩm nào dưới đây là nguồn cung cấp dồi dào chất xơ và vitamin C nhất?",
    options: [
      "Rau xanh (rau muống, cải bó xôi) và trái cây tươi (cam, bưởi, ổi)",
      "Thịt heo quay và mỡ heo",
      "Cơm trắng và bánh mì trắng",
      "Bơ đậu phộng và phô mai"
    ],
    answer: 0,
    explanation: "Rau xanh và trái cây tươi là nguồn cung cấp dồi dào vitamin C, carotenoid và chất xơ tự nhiên, giúp đường ruột khỏe mạnh và tăng sức đề kháng mùa thi."
  },
  {
    id: 4,
    difficulty: "Dễ",
    level: 1,
    question: "Bữa ăn nào trong ngày được xem là quan trọng nhất để cung cấp năng lượng cho buổi học?",
    options: [
      "Bữa ăn khuya lúc 23h đêm",
      "Bữa ăn sáng (khoảng 30% tổng năng lượng cả ngày)",
      "Bữa ăn xế lúc 16h",
      "Bỏ bữa sáng để giảm cân"
    ],
    answer: 1,
    explanation: "Bữa sáng sau một đêm dài nhịn ăn cung cấp glucose cho não bộ hoạt động, giúp học sinh tập trung, tiếp thu bài giảng tốt và không bị hạ đường huyết trong tiết học."
  },
  {
    id: 5,
    difficulty: "Dễ",
    level: 1,
    question: "Một ly trà sữa trân châu size L (700ml) có hàm lượng calo tương đương khoảng mấy bát cơm trắng?",
    options: [
      "Chỉ bằng 1/2 bát cơm",
      "Tương đương 2.5 – 3 bát cơm trắng (khoảng 550 - 650 kcal)",
      "Không chứa calo vì là dạng nước",
      "Tương đương 10 bát cơm"
    ],
    answer: 1,
    explanation: "Một ly trà sữa trân châu size L chứa khoảng 550 - 650 kcal, chủ yếu là đường tinh luyện và kem béo thực vật (chất béo bão hòa), tương đương năng lượng của gần 3 bát cơm trắng!"
  },

  // --- CẤP ĐỘ TRUNG BÌNH (Chỉ số thể trạng, thành phần vi chất, dị ứng) ---
  {
    id: 6,
    difficulty: "Trung bình",
    level: 2,
    question: "Chỉ số BMI (Body Mass Index) ở người Việt Nam trong khoảng nào được đánh giá là 'Bình thường'?",
    options: [
      "Dưới 16.0",
      "Từ 18.5 đến 22.9",
      "Từ 23.0 đến 24.9",
      "Trên 25.0"
    ],
    answer: 1,
    explanation: "Theo chuẩn phân loại của Hiệp hội Đái tháo đường châu Á (IDI & WPRO), người châu Á có BMI bình thường từ 18.5 đến 22.9. Dưới 18.5 là gầy, 23.0 - 24.9 là thừa cân/tiền béo phì, từ 25.0 trở lên là béo phì."
  },
  {
    id: 7,
    difficulty: "Trung bình",
    level: 2,
    question: "Tại sao người có cơ địa dị ứng đậu phộng (lạc) cần cực kỳ thận trọng khi ăn mì Quảng, bún thịt nướng hay bánh tráng trộn?",
    options: [
      "Vì các món này có nhiều rau xanh",
      "Vì các món này thường rắc đậu phộng rang giã nhỏ lên trên để tăng hương vị",
      "Vì các món này nấu từ thịt heo",
      "Vì nước dùng các món này chứa nhiều đá lạnh"
    ],
    answer: 1,
    explanation: "Mì Quảng, bún thịt nướng, bánh tráng trộn truyền thống luôn được rắc đậu phộng rang giã nhỏ. Protein trong đậu phộng có thể kích hoạt phản ứng dị ứng nghiêm trọng (sốc phản vệ) ở người nhạy cảm."
  },
  {
    id: 8,
    difficulty: "Trung bình",
    level: 2,
    question: "Chất béo Omega-3 (DHA & EPA) có nhiều trong cá hồi, cá nục, cá thu đóng vai trò gì cho học sinh?",
    options: [
      "Gây buồn ngủ trong giờ học",
      "Phát triển màng tế bào thần kinh não bộ, tăng trí nhớ và bảo vệ võng mạc mắt",
      "Làm chậm nhịp tim xuống mức nguy hiểm",
      "Thay thế hoàn toàn chất đạm"
    ],
    answer: 1,
    explanation: "Omega-3 là axit béo thiết yếu cơ thể không tự tổng hợp được, cấu tạo nên màng tế bào thần kinh, tăng kết nối synapse giúp học sinh ghi nhớ bài tốt hơn và hạn chế mỏi mắt."
  },
  {
    id: 9,
    difficulty: "Trung bình",
    level: 2,
    question: "Tỷ lệ phân bổ năng lượng khuyến nghị lý tưởng giữa 3 bữa chính trong ngày là bao nhiêu?",
    options: [
      "Sáng 10% – Trưa 30% – Tối 60%",
      "Sáng 30% – Trưa 40% – Tối 30%",
      "Sáng 50% – Trưa 50% – Bỏ bữa tối",
      "Ăn tùy hứng không theo tỷ lệ"
    ],
    answer: 1,
    explanation: "Tỷ lệ chuẩn 30% (Sáng) - 40% (Trưa) - 30% (Tối) giúp duy trì năng lượng ổn định suốt cả ngày học, tránh tình trạng đói run tay buổi sáng hoặc quá no chướng bụng khó ngủ vào ban đêm."
  },
  {
    id: 10,
    difficulty: "Trung bình",
    level: 2,
    question: "Khi chọn khẩu phần ăn Size S (70%) thay vì Size M (100%), lượng calo và các chất dinh dưỡng sẽ thay đổi như thế nào?",
    options: [
      "Tăng lên 30%",
      "Giảm đi 30% (bằng 70% khẩu phần chuẩn)",
      "Giữ nguyên không đổi",
      "Chỉ giảm calo còn đạm và béo giữ nguyên"
    ],
    answer: 1,
    explanation: "Khẩu phần Size S tương ứng với 70% trọng lượng chuẩn (tỷ lệ 0.7), do đó calo, chất đạm, chất béo và carbohydrate đều giảm tương ứng 30% so với suất chuẩn Size M."
  },

  // --- CẤP ĐỘ KHÓ (Phân tích chuyển hóa dinh dưỡng, ứng dụng nâng cao) ---
  {
    id: 11,
    difficulty: "Khó",
    level: 3,
    question: "1 gram Chất đạm (Protein), 1 gram Bột đường (Carb) và 1 gram Chất béo (Fat) giải phóng lần lượt bao nhiêu năng lượng (kcal)?",
    options: [
      "4 kcal – 4 kcal – 9 kcal",
      "9 kcal – 4 kcal – 4 kcal",
      "4 kcal – 9 kcal – 4 kcal",
      "2 kcal – 2 kcal – 5 kcal"
    ],
    answer: 0,
    explanation: "Hệ số Atwater chuẩn quốc tế: 1g Protein cung cấp 4 kcal, 1g Carbohydrate cung cấp 4 kcal, còn 1g Chất béo cung cấp tới 9 kcal (gấp hơn 2 lần đạm và bột đường)."
  },
  {
    id: 12,
    difficulty: "Khó",
    level: 3,
    question: "Một học sinh nam 17 tuổi, cao 170cm, nặng 60kg, tập thể thao vừa phải (hệ số 1.55). Nhu cầu TDEE tính theo công thức Mifflin-St Jeor khoảng bao nhiêu?",
    options: [
      "Khoảng 1.200 kcal/ngày",
      "Khoảng 2.200 - 2.400 kcal/ngày",
      "Khoảng 3.500 kcal/ngày",
      "Khoảng 1.600 kcal/ngày"
    ],
    answer: 1,
    explanation: "BMR = 10*(60) + 6.25*(170) - 5*(17) + 5 = 600 + 1062.5 - 85 + 5 = 1582.5 kcal. TDEE = BMR * 1.55 ≈ 2.450 kcal (duy trì mức 2.200 - 2.450 kcal là hợp lý)."
  },
  {
    id: 13,
    difficulty: "Khó",
    level: 3,
    question: "Tại sao chế độ ăn thừa muối (trên 5g muối/ngày) từ đồ ăn vặt đóng gói lại gây nguy cơ cao cho học sinh?",
    options: [
      "Gây hạ đường huyết đột ngột",
      "Làm tăng đào thải Canxi qua nước tiểu (dễ loãng xương) và tăng áp lực lên thành mạch, tăng huyết áp",
      "Làm tiêu hủy hết vitamin C",
      "Làm giảm cân quá mức"
    ],
    answer: 1,
    explanation: "Natri dư thừa buộc thận phải tăng đào thải, đồng thời kéo theo Canxi ra ngoài qua nước tiểu gây ảnh hưởng phát triển chiều cao của học sinh, đồng thời giữ nước gây tăng huyết áp sớm."
  },
  {
    id: 14,
    difficulty: "Khó",
    level: 3,
    question: "Thực phẩm nào sau đây chứa 'Calo rỗng' (Empty calories) mà học sinh nên hạn chế tiêu thụ?",
    options: [
      "Khoai lang luộc",
      "Nước ngọt có ga và kẹo dẻo màu (nhiều đường tinh luyện nhưng không có vitamin, khoáng chất hay chất đạm)",
      "Trứng luộc",
      "Ức gà áp chảo"
    ],
    answer: 1,
    explanation: "'Calo rỗng' là loại thực phẩm cung cấp nhiều năng lượng nhưng hầu như không mang lại chất xơ, vitamin, khoáng chất hay axit amin thiết yếu, dễ gây béo phì nhưng lại thiếu chất vi lượng."
  },
  {
    id: 15,
    difficulty: "Khó",
    level: 3,
    question: "Đối với học sinh bị dị ứng hải sản (tôm, cua), khi đi ăn lẩu mắm miền Tây hay bún riêu, nguy cơ dị ứng đến từ thành phần nào?",
    options: [
      "Bún tươi và sả ớt",
      "Nước dùng nấu từ cua đồng, cá mắm, tôm khô hoặc dùng nước cốt tôm cua",
      "Cà tím và bông so đũa",
      "Đậu bắp luộc"
    ],
    answer: 1,
    explanation: "Nước dùng lẩu mắm hoặc bún riêu chứa chiết xuất cua đồng, cá mắm, tôm khô đun sôi. Protein dị nguyên Tropomyosin trong hải sản không bị phân hủy bởi nhiệt độ sôi thông thường."
  }
];

// Hàm tạo 5 câu hỏi ngẫu nhiên tăng dần độ khó: 2 Dễ + 2 Trung bình + 1 Khó
function generateDaily5Questions() {
  const easyPool = NUTRITION_QUIZ_BANK.filter(q => q.level === 1);
  const medPool = NUTRITION_QUIZ_BANK.filter(q => q.level === 2);
  const hardPool = NUTRITION_QUIZ_BANK.filter(q => q.level === 3);

  const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

  const selected = [
    ...shuffle(easyPool).slice(0, 2),
    ...shuffle(medPool).slice(0, 2),
    ...shuffle(hardPool).slice(0, 1)
  ];

  return selected;
}
