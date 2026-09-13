Bản rà soát Case 01 và brief Case 02 — 09/09/2026

Phạm vi: đọc `index.html`, `app.js`, `styles.css` và toàn bộ tài liệu người dùng. Đây là phân tích tĩnh mã và kiểm tra logic của công thức được cung cấp; chưa chạy UI. Node không có sẵn trên PATH trong môi trường kiểm tra. Không sửa mã game trong lượt soạn prompt này. Số dòng dưới đây trỏ tới phiên bản mã tại thời điểm rà soát.

**Các lỗi cần xử lý trước khi triển khai Case 02**

| Vấn đề | Bằng chứng | Hệ quả / hướng sửa |
| --- | --- | --- |
| Case 01 kết thúc giả sau D5 | `app.js:97–119` không khai báo d6; `:433` chuyển d5 → d6; `:397` gọi renderResult khi không có decision | Bổ sung định nghĩa D6 và điều hướng kết quả theo terminal status. |
| Kết thúc sớm và D8 không chuyển màn đúng | `app.js:268`, `:297`, `:397`, `:433` | CLIENT_WITHDREW vẫn có thể ở D3; hoàn tất D8 vẫn để currentDecisionId=d8. Cần trạng thái kết thúc không nhận thêm lựa chọn. |
| Giao diện chỉ đáp án | `app.js:41–116`, `:123–140`, `:378`, `:391` | Tag, màu và mô tả nói thẳng Root cause, Red herring, đáp án sai và parameter đề xuất. Phải sửa cả nội dung, không chỉ ẩn tag. |
| Feedback xuất hiện giữa ván | `app.js:255–300`, `:394`, `:405` | lastFeedback của bước trước được render ở bước sau. Chuyển đánh giá sang tổng kết; giữ dữ kiện/evidence độc lập. |
| Không có menu nhiều case | `index.html:21`, `:33`; `app.js:147`, `:439–440` | Ứng dụng vào Case 01 hoặc resume ngay. Cần app route menu và state riêng từng case. |
| Ba kết cục tài chính vững không thể đạt | Công thức Màn 12: thưởng lớn nhất PD-F = 4; mọi modifier còn lại không dương; ngưỡng vững ≥5 | Ngay cả giả sử đủ Uy tín chọn F, cả hàng “Sống sót vững” vẫn không thể xuất hiện. |
| “Chết trong danh dự” không thể đạt | Quản trị tối đa HS-G +1 và ưu tiên gia đình +2; sụp đổ tài chính trừ 2 | Điểm tối đa khi sụp đổ = 1, thấp hơn ngưỡng đoàn kết ≥3. |
| Uy tín Case 02 chưa được định nghĩa đủ | Có phạt −1 và điều kiện Trung bình/Cao, nhưng không có điểm đầu, ngưỡng số hoặc luật tăng | Không xác định được phê duyệt PD-A/F. Cần rubric rõ và kiểm thử các đường đạt từng tier. |

Với công thức Case 02 nguyên bản và giả định cộng từ 0 vì không có điểm nền được khai báo, ít nhất 4/9 ô ma trận không thể đạt. Tự thêm một điểm nền để “sửa” mà không ghi vào luật là thay đổi thiết kế, không phải cách diễn giải công thức có sẵn.

**Supporting Evidence của Case 01: đã có phần đúng nhưng chưa đáp ứng yêu cầu**

`renderD4()` ở `app.js:384` đã lọc DISCOVERED/VERIFIED. Vì vậy không chính xác nếu nói hiện tại danh sách hiển thị toàn bộ evidence chưa thu thập. Những phần còn thiếu là:

- Cùng dòng này in toàn bộ `e.text` ngay dưới tên; click ở `:431` chỉ bật/tắt lựa chọn, không mở chi tiết riêng.
- UI giới hạn 5 evidence nhưng `validateSelection()` tại `:231–234` chỉ kiểm tra có ít nhất một mục, không xác thực ID, quyền thu thập, trùng hoặc giới hạn.
- `calculateScores()` tại `:360–361` chỉ cộng evidence cùng relevance; không trừ mục không liên quan hoặc phản bác. Cùng chủ đề không đồng nghĩa cùng chiều lập luận: E10 xác nhận 30/45 tỷ hợp lệ (`:27`) nhưng vẫn cộng điểm cho diagnosis B cho rằng toàn bộ Unbilled là doanh thu ảo (`:78`).
- D1 chọn B rồi D2 bỏ qua có thể không có evidence DISCOVERED/VERIFIED; D4 lại bắt buộc ít nhất một. UI bảo quay lại nhưng không có đường quay lại. Cần đường chẩn đoán chưa có căn cứ, được đánh giá cuối ván, hoặc một cơ chế điều tra bổ sung được thiết kế rõ.

Một quy tắc MVP đề xuất là tối đa 3 evidence, panel xem chi tiết riêng, điểm có trần khi đủ căn cứ và phạt evidence không liên quan/phản bác. Con số 3 là đề xuất trong prompt, không phải yêu cầu số học đã có trong brief. Dùng cùng giới hạn cho mọi diagnosis để không gợi ý đáp án bằng số ô cần chọn.

**Các lỗi thu thập evidence và mô phỏng Case 01 liên quan trực tiếp**

- `handleChoice()` tại `app.js:423` xử lý F như lựa chọn bỏ qua cho cả D1 và D2. D1 F thực tế là “Xem chi tiết từng lớp phải thu”. Chọn F rồi A làm mất F, nhưng chọn A rồi F giữ cả hai. Đây là lỗi phụ thuộc thứ tự thao tác.
- `app.js:250–251` có thể hạ E5 từ DISCOVERED xuống CLUE khi xử lý một danh sách chứa F rồi B. Trạng thái đã biết cần tiến một chiều; việc nhận thêm manh mối không được xóa xác minh cũ.
- D2 A khai báo `requires: ['E5', 'E5clue']` (`:54`), nhưng renderer yêu cầu cả hai (`:402`). Manh mối E5 từ D1 B không tự mở được bước xác minh như cách khai báo này có vẻ dự định. Phải nói rõ prerequisite nào là ANY, cái nào là ALL.
- Live Trust/Understanding/Stress và độ đầy đủ có trọng số (`:414`) có thể tiết lộ chất lượng lựa chọn dù đã ẩn hộp feedback. Debug (`:417`, `:435`) còn cho xem state đầy đủ. Những thành phần này không phù hợp với quy tắc người dùng muốn.
- Event báo việc thu tiền (`:317–319`), nhưng thực thu chỉ được ghi ở nhánh chọn Reforecast (`:328–332`). Cùng sự kiện bên ngoài không nên biến thành một khoản thu có/không chỉ vì chọn đáp án được chấm cao.
- Nhánh nguồn tiền Long (`:339`) cho thu ở cả phương án đòi ngay, trong khi mô tả D8 C (`:115`) đòi formalization. Kỳ thu tiền và hạn trả nợ cũng cần đối chiếu với engine thay vì chỉ hiển thị như nhãn. Đây là mục cần kiểm thử mô phỏng, không chỉ sửa chữ.

**Mâu thuẫn và khoảng trống trong Case 02**

| Nội dung | Vấn đề | Yêu cầu đưa vào prompt |
| --- | --- | --- |
| Điều kiện CD-F | Sau HS-F nói thiếu HS-G sẽ thiếu căn cứ chọn CD-F; Màn 6 chỉ yêu cầu HS-D + một trong A/B/E/F | Thống nhất theo Màn 6; G hỗ trợ governance, không bắt buộc cho diagnosis tài chính + vận hành. |
| CD-E | Bằng chứng ghi traditional categories co lại, nhưng HS-E cho tăng +2,5%/+1,1% | Sửa luận cứ về phần entertainment/licensing suy yếu; không đảo dấu dữ liệu. |
| Hồ sơ HS-G | Có tên trong danh sách nhưng thiếu một khối hồ sơ đầy đủ riêng như A–F | Xây riêng nội dung hợp đồng, cơ cấu sở hữu, thư và động thái Richard. |
| Quyền biết thỏa thuận | CH1-D/G nêu thông tin điều khoản; CH2-G tiết lộ ngưỡng ngay ở câu hỏi | Phân biệt lời đồn với xác minh; dùng biến thể nội dung theo HS-G, không cho câu hỏi thay thế toàn bộ hồ sơ. |
| BCTC không giới hạn | BCTC Màn 4 lặp nhiều dữ kiện của C/D trong khi hồ sơ cũ bị khóa | Khóa hồ sơ gốc, không khóa một dữ kiện đã được nguồn mới công khai. Theo dõi provenance. |
| Diagnosis cards | Brief muốn trình bày bằng chứng ủng hộ mạnh nhất cạnh mỗi diagnosis | Mâu thuẫn yêu cầu cuối: người chơi phải tự liên kết evidence. Giữ mapping này cho builder. |
| Phác đồ bị hạ | Chưa quy định state lưu đề nghị và thực thi ra sao | Lưu cả hai, đóng băng phê duyệt theo Uy tín thời điểm đó; diễn biến dựa treatment thực thi. |
| Tái khám | Không định nghĩa “dữ liệu mới”, thứ tự trừ Uy tín/duyệt, hoặc phép tính hai kỳ | Cần evidence mới có liên hệ cụ thể; chốt một lần; không tính hồi tố hoặc cộng hai lần toàn bộ thưởng. |
| TG-C | Có phạt nếu refinance thất bại nhưng không có luật thành/bại | Mô hình xác định hoặc seed lưu cố định. Các thời điểm phải có hệ quả khớp mô tả. |
| PD-B và PD-F | B cho +3 cash ngắn hạn vào thước đo sống sót cuối; F +4 nhưng “rủi ro thực thi cao nhất” chưa có cơ chế | Tách cash ngắn hạn khỏi sức khỏe dài hạn, mô hình hóa đánh đổi, tránh F tự động tối ưu. |
| Kích hoạt Houndstooth | Thiếu biến EBITDA và quyền thực hiện giao dịch; chưa rõ Michael được định đoạt cổ phần của ai | 5% dưới 792m = 752,4m; chọn rõ dấu so sánh, kỳ đo và phạm vi hợp đồng hư cấu. Không suy việc tiếp quản chỉ từ điểm Tài chính. |
| Chapter 11 | Brief nói tự vô hiệu hóa thỏa thuận chưa kích hoạt | Đặt đây là giả định hợp đồng của case; tài liệu hiện có không đủ để kết luận quy tắc pháp lý chung. |
| Vai vế gia đình | “Bộ tứ”, “ba anh em”, nhưng nhân vật là hai anh em và một chú | Sửa câu chữ nhất quán. |

Màn 10 và yêu cầu “feedback chỉ cuối ván” không bắt buộc mâu thuẫn. Người chơi cần thông tin mới để tái khám; có thể hiển thị tình trạng hàng hóa, phản ứng chủ nợ, dòng tiền và biên bản hội đồng như evidence. Điều không được hiển thị là lời đánh giá hoặc công thức giải thích lựa chọn nào đã được cộng/trừ điểm.

Một dữ kiện có thể là lời đồn hoặc chưa đủ căn cứ; giao diện được nói rõ mức xác minh khách quan, nhưng không được tự gắn nhãn “nhiễu” hoặc “đáp án đúng”. Tương tự, evidence phản bác một giả thuyết vẫn có thể là dữ kiện quan trọng. Hệ thống chấm hướng lập luận, không chỉ số file đã chọn.

**Đề xuất sửa ma trận để tham khảo, chưa phải phương án cân bằng hoàn chỉnh**

Một phương án thay đổi nhỏ là tăng PD-F được duyệt từ +4 lên +5 và chỉ áp dụng −2 Quản trị do sụp đổ khi không ưu tiên Governance & Family. Hai thay đổi này giữ các ngưỡng cũ và mở đủ 9 ô: gia đình đã chuẩn bị vẫn có thể cùng chịu trách nhiệm khi công ty thất bại.

Minh họa: chọn TG-A và Holiday Inventory. Ba hàng dùng PD-F được duyệt (+5), PD-A được duyệt (+2), PD-E thiếu Suppliers (−2). Ba cột dùng HS-G + ưu tiên Governance (3), không HS-G + ưu tiên Governance (2), không HS-G + không ưu tiên Governance (−1; −3 khi sụp đổ). Có thể chọn đủ 3 hồ sơ và 3 nhóm ưu tiên trong mỗi tổ hợp; với F, vẫn có thể mở D+A để tạo căn cứ dù hồ sơ thứ ba có hoặc không có G.

Đây chỉ là chứng minh khả năng đạt ma trận có điều kiện vào việc rubric Uy tín cho phép duyệt A/F. Nó chưa giải quyết lợi thế tự động của F hoặc rủi ro dài hạn của B, và chưa phải kiểm thử end-to-end. AI triển khai phải chọn, ghi rõ và kiểm thử cân bằng cuối cùng; không chép hai thay đổi này rồi tuyên bố mọi phác đồ đã cân bằng.

**Tính nhất quán giữa hai case và tài liệu cũ**

| Thành phần | Case 01 hiện có | Case 02 yêu cầu | Cách thống nhất |
| --- | --- | --- | --- |
| Bối cảnh | Nam Phát, SME xây dựng, tỷ VND | Toy Kingdom, bán lẻ, triệu/tỷ USD | Hai dữ liệu độc lập. |
| Tiến trình | D1–D8, diagnosis ở D4 | Màn 0–12, diagnosis ở Màn 6 | Dùng cấu hình theo case, không ép cùng số màn. |
| Đánh giá | Counselor Process / Financial Outcome / Client Experience | Uy tín / Tài chính / Quản trị | Giữ rubric riêng, chung cách trình bày cuối ván. |
| Evidence | Thu thập/xác minh từ lựa chọn | 3 hồ sơ + câu hỏi + BCTC + diễn biến | Dùng chung nguyên tắc provenance và không lộ lời giải; giới hạn thu thập tùy case. |
| Tái khám | Sự kiện trước D8 | 7 diễn biến ở Màn 10, đổi tại Màn 11 | Sự kiện là dữ kiện; đánh giá sau bước cuối. |
| Hệ quả tài chính | Có planned/realized nhưng một số nhánh bị trộn với chấm đáp án | Điểm tổng hợp và ma trận, thiếu mô hình thời gian | Không dùng đáp án được ưa thích để thay đổi một sự kiện đã xảy ra. |

SOURCE_USE_MAP/SAMPLE_INPUT_OUTPUT ở cuối brief ghi “Case #01 — Toys R Us”. Đó không phải Case 01 Nam Phát đang có trong mã. Các ví dụ còn dùng 4 options A–D, điểm 100 và xác suất Chapter 11, trong khi MVP Case 02 dùng 6 CD, 6 PD, 4 TG và ma trận. Phải đánh dấu các ví dụ này là tài liệu thiết kế cũ, không cho chúng ghi đè luật mới.

Niên đại lịch sử trong phần nguồn và niên đại mô phỏng FY2024–2026/LBO 2015 cần tách rõ. Tỷ lệ sở hữu gia đình 78%/quỹ 22% không đồng nghĩa tỷ lệ tài trợ nợ/vốn 78%/22%. Phần gia tộc, hợp đồng Michael–Houndstooth và tranh chấp bảo hiểm không được gán cho hồ sơ lịch sử chỉ vì đặt cạnh số liệu tham khảo.

Những phép tính và đối chiếu trên dựa vào dữ liệu đã được người dùng cung cấp, không phải một đợt xác minh nguồn tài chính hoặc pháp lý bên ngoài.
