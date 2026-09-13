Bạn đang tiếp tục phát triển game “Bác sĩ tài chính / MEDIFIN” trong repository hiện có. Hãy đọc mã, triển khai và kiểm thử trực tiếp; không chỉ trả về kế hoạch hoặc giao diện mẫu.

Đầu vào cần đọc: `index.html`, `styles.css`, `app.js`, `docs/CASE02_SOURCE_BRIEF.md` và `docs/CONSISTENCY_REVIEW.md`. Tệp source brief giữ nguyên tài liệu người dùng, bao gồm cả những phần thiết kế cũ đang mâu thuẫn. Bản rà soát chỉ rõ các vấn đề đã tìm thấy; các phương án cân bằng trong đó là đề xuất, không phải luật đã được người dùng chốt.

Ưu tiên yêu cầu theo thứ tự: các quy tắc trải nghiệm trong prompt này → luồng MVP 13 màn của Case 02 → nội dung nguồn và ví dụ cũ chỉ để tham khảo. Không nhập luật chấm điểm cũ vào Case 02 khi chúng mâu thuẫn với MVP. Những quy tắc còn thiếu phải được định nghĩa trong tài liệu builder, ghi rõ là giả định thiết kế mới và được kiểm thử trước khi bàn giao.

1. Mục tiêu và phạm vi

Giữ Case 01 là Nam Phát — SME Construction, “Khủng hoảng vốn lưu động / Ngâm vốn”. Xây dựng Case 02 là Toy Kingdom Inc. — gia tộc Anderson, theo luồng 13 màn từ 0 đến 12. Case 03 chưa triển khai.

Giữ phong cách MEDIFIN hiện có, dùng ngôn ngữ giao diện nhất quán và hiển thị tốt trên điện thoại lẫn máy tính. Tận dụng cấu trúc HTML/CSS/JavaScript hiện tại; chỉ tổ chức lại mã khi cần để tách logic hai case và kiểm thử. Không đổi framework chỉ để thêm case.

Sửa những lỗi Case 01 ảnh hưởng trực tiếp đến luồng chơi, evidence, chấm điểm lập luận và nguyên tắc trải nghiệm chung. Không thay Case 01 bằng case Toys “R” Us trong phần ví dụ cũ.

2. Menu xuất hiện ngay khi mở game

Mở hoặc tải lại ứng dụng phải gặp menu chọn case, kể cả khi đã có bản lưu. Không tự vào Case 01 hoặc tự tiếp tục một ván.

Menu có ba lựa chọn: Case 01 — Nam Phát; Case 02 — Toy Kingdom Inc.; Case 03 — Incoming. Case 01 và 02 chơi được. Case 03 chỉ hiển thị, có trạng thái disabled thực sự và không mở bằng chuột, bàn phím hay điều hướng nội bộ.

Với case đã có tiến trình, cung cấp “Tiếp tục” và “Chơi lại”. Trong game có đường về menu. Tách state, history, evidence và bản lưu theo caseId; chơi lại một case không xóa tiến trình case khác. Xử lý bản lưu Case 01 cũ và dữ liệu lỗi bằng quy tắc migration/reset rõ ràng, không khiến giao diện kẹt.

3. Không để giao diện chỉ đáp án

Trước khi kết thúc ván, chỉ hiển thị tên lựa chọn và mô tả trung tính về hành động hoặc giả thuyết. Giữ các thông tin cần thiết để hiểu hành động như số tiền, kỳ hạn, phạm vi đàm phán; không kèm đánh giá hiệu quả của lựa chọn.

Không hiển thị điểm thưởng/phạt, trọng số, xác suất thành công nội bộ, đáp án, điều kiện điểm Uy tín, tag như “Root cause”, “Red herring”, “Balanced”, “Recommended”, “đề xuất”, hoặc câu mô tả kiểu “nhầm nguyên nhân”, “xử lý đúng bệnh”. Không dùng màu sắc, icon, tooltip hay nhãn accessibility để ngầm chỉ lựa chọn tốt/xấu. Chỉ bỏ tag là chưa đủ: phải biên tập lại cả mô tả đang tiết lộ lời giải.

Cột “Bằng chứng ủng hộ mạnh nhất”, “Điều kiện / Đánh đổi / Rủi ro” và công thức điểm trong brief là thông tin dành cho builder. Không đưa nguyên văn lên thẻ lựa chọn. Không tự đánh dấu evidence nào phù hợp với diagnosis đang chọn.

Trong lúc chơi, cho xem số lượt còn lại, số mục đã chọn, dữ kiện đã thu thập và những diễn biến đã công bố. Không hiển thị live score, Trust/Uy tín, độ hoàn thiện có trọng số, cờ đúng/sai hoặc thanh tiến độ suy ra chất lượng quyết định. Các chỉ số tài chính chỉ hiện khi người chơi đã được cung cấp chúng trong hồ sơ hoặc diễn biến. Bỏ nút debug khỏi luồng người chơi; chế độ builder nếu giữ lại phải tách riêng, tắt mặc định.

4. Chỉ đánh giá sau quyết định cuối

Sau mỗi xác nhận, có thể báo trung tính “Đã ghi nhận” hoặc hiển thị câu trả lời/hồ sơ vừa mở. Không hiện feedback đánh giá, điểm thay đổi, lời khen/chê hay hướng dẫn nên đổi lựa chọn nào.

Thông tin thu thập được gọi là “Evidence / Bằng chứng”; tin mới trong mô phỏng gọi là “Diễn biến”. Nội dung phải là dữ kiện có nguồn hoặc lời NPC theo bối cảnh, không phải lời chấm bài được đổi nhãn thành evidence.

Case 02 vẫn cần Màn 10 trước Màn 11: Màn 10 cung cấp dữ kiện để người chơi tái khám, không nhận xét họ làm đúng/sai. Case 01 áp dụng tương tự với sự kiện trước Follow-up. Feedback phân tích chỉ xuất hiện ở màn tổng kết, sau quyết định cuối hoặc một kết thúc sớm hợp lệ; không tiếp tục cho ra quyết định sau khi đã hiển thị tổng kết.

5. Làm lại Supporting Evidence, đặc biệt Decision 4 của Case 01

Chỉ liệt kê evidence thực sự đã thu thập/xác minh từ các quyết định trước. Không hiển thị toàn bộ kho evidence rồi cho chọn; không coi CLUE hoặc LOCKED là bằng chứng đã xác minh. Mỗi bằng chứng có ID, nguồn, bước thu thập và mức xác minh. Kiểm tra quyền sử dụng lại khi xác nhận, không chỉ lúc render.

Danh sách chỉ có tên evidence và trạng thái đã chọn. Người chơi bấm tên để mở chi tiết trong panel/modal; trong đó có thao tác riêng “Dùng làm bằng chứng” / “Bỏ chọn”. Đọc không đồng nghĩa với chọn. Không in sẵn đoạn giải thích dưới từng tên evidence. Hỗ trợ bàn phím, đóng modal và trả focus đúng nơi.

Áp dụng giới hạn chung 1–3 evidence cho mỗi lần chẩn đoán như một quy tắc MVP đề xuất. Không thay đổi giới hạn theo đáp án đang chọn để tránh vô tình gợi ý. Không thưởng thêm chỉ vì chọn nhiều; không cho một evidence lặp ID hoặc cùng dữ kiện lặp ở hai nguồn được tính thành hai luận điểm độc lập.

Builder phải định nghĩa quan hệ cụ thể giữa evidence và từng diagnosis: ủng hộ, phản bác, bối cảnh, không liên quan. Chấm chất lượng, tính đủ và tính phù hợp của tập bằng chứng. Evidence không liên quan hoặc trực tiếp mâu thuẫn phải làm giảm điểm lập luận theo rubric nội bộ; evidence củng cố hợp lệ không tự động bị phạt chỉ vì vượt số lượng tối thiểu. Chỉ giải thích các quan hệ này ở tổng kết.

Không dùng chung một nhãn chủ đề như `unbilled` để kết luận rằng mọi evidence cùng chủ đề đều ủng hộ. Ví dụ E10 của Case 01 xác nhận 30/45 tỷ Unbilled hợp lệ nên không được cộng điểm ủng hộ giả thuyết “toàn bộ Unbilled là doanh thu ảo”.

Nếu một đường chơi hợp lệ không thu được evidence, phải có đường tiếp tục với trạng thái “chẩn đoán chưa có bằng chứng” và chịu đánh giá cuối ván. Không bịa evidence, không mở lại hồ sơ bị khóa, không để game kẹt ở nút Confirm. Không hứa “quay lại điều tra” nếu không có chức năng đó.

Quy tắc này dùng ở Case 01 Decision 4 và bước chẩn đoán/tái khám tương ứng của Case 02. Case 02 chẩn đoán ở Màn 6, không phải Màn 4.

6. Triển khai đầy đủ Case 02, không rút gọn các bước

| Màn | Nội dung | Quy tắc |
| --- | --- | --- |
| 0 | Hồ sơ tiếp nhận | Hiển thị tổng quan Toy Kingdom đầy đủ và nút bắt đầu khám. |
| 1 | Phòng khám | Hội thoại David, bối cảnh vận hành và gia đình; chuyển sang chẩn đoán. |
| 2 | Bảng sinh hiệu | Chọn đúng 3/7 hồ sơ HS-A…G; xác nhận rồi đọc nội dung; 4 hồ sơ còn lại khóa suốt ván. |
| 3 | Câu hỏi bổ sung | Chọn đúng 2/7 CH1-A…G; chỉ hiện câu trả lời đã chọn; dữ kiện ở mức bề mặt. |
| 4 | BCTC đầy đủ | Xem các báo cáo không giới hạn từ đây; chỉ chú thích quản trị đã được cấp quyền mới xuất hiện. |
| 5 | Câu hỏi cuối | Chọn đúng 1/7 CH2-A…G; giữ điều kiện truy cập dữ kiện nhạy cảm. |
| 6 | Chẩn đoán | Chọn 1/6 CD-A…F và tự chọn evidence đã thu thập. |
| 7 | Bàn điều trị | Chọn 1/6 PD-A…F; engine xử lý phê duyệt nội bộ. |
| 8 | Thời điểm | Chọn 1/4 TG-A…D. |
| 9 | Chuẩn bị | Chọn đúng 3/7 nhóm ưu tiên. |
| 10 | Diễn biến | 7 cập nhật Sales, Vendor, Liquidity, Store, Digital, Debt, Family/Board xuất hiện theo thứ tự, dựa trên state thực tế. |
| 11 | Tái khám | Giữ nguyên hoặc đổi diagnosis, treatment, hoặc cả hai; có thể viện dẫn evidence mới. Chốt tái khám một lần. |
| 12 | Đóng case | Tổng kết, ma trận kết cục, feedback và lịch sử lựa chọn. Có Close Case về menu và Reopen Case bắt đầu ván mới. |

Ở Màn 2, chỉ xem tên/phạm vi hồ sơ trước xác nhận, không cho đọc thử cả 7 rồi mới chốt 3. Quy tắc tương tự áp dụng với câu trả lời ở Màn 3 và 5. Người chơi được đọc lại nội dung đã mở qua sổ evidence; không đổi lựa chọn đã xác nhận và không mở thêm hồ sơ bị khóa bằng Back, reload hoặc tái khám.

7. Giải quyết mâu thuẫn nội dung và quyền biết thông tin

Tạo HS-G thành một hồ sơ riêng đầy đủ. Phân biệt lời đồn, lời trả lời bề mặt và bằng chứng hợp đồng đã xác minh. Chưa mở HS-G thì không được vô tình biết toàn văn hoặc độ chắc chắn pháp lý của thỏa thuận Michael–Houndstooth qua CH1-D, CH1-G, tiêu đề CH2-G, chú thích BCTC hay màn tổng kết của một bước trung gian. Viết các biến thể câu hỏi/câu trả lời theo quyền biết thông tin; nếu cho biết ngưỡng 5% dưới dạng lời đồn thì phải thể hiện đúng mức độ xác minh.

BCTC Màn 4 có thể cung cấp lại các số liệu từng xuất hiện ở HS-C/HS-D. Ghi nhận những dữ kiện tài chính công khai đó là evidence mới hợp lệ từ BCTC; điều này không mở lại hồ sơ C/D hoặc tiết lộ nội dung riêng chưa được thu thập.

Điều kiện bằng chứng cho CD-F thống nhất là đã mở HS-D và ít nhất một HS-A/HS-B/HS-E/HS-F, đồng thời người chơi thực sự viện dẫn bằng chứng liên quan. HS-G hỗ trợ kết luận quản trị, không phải điều kiện bổ sung bắt buộc cho CD-F. Thiếu căn cứ thì xử lý Uy tín nội bộ và giải thích cuối ván; không gắn nhãn CD-F là đáp án tốt nhất.

Sửa phần giải thích CD-E: HS-E cho thấy traditional toys ngoài entertainment vẫn tăng (+2,5% domestic; +1,1% consolidated), vì vậy không nói “đồ chơi truyền thống co lại”. Giả thuyết về danh mục phải xoay quanh entertainment/licensing suy yếu và cơ cấu danh mục, bám số liệu nguồn.

Thống nhất David và Michael là hai anh em, Richard là chú; bỏ “bộ tứ” và “ba anh em”. Giữ gia đình Anderson 78% và quỹ 22% là tỷ lệ sở hữu; không trộn với tỷ lệ nợ/vốn của tài liệu LBO cũ.

8. Hoàn thiện engine Case 02 trước khi gắn kết cục

Ba trục là Uy tín, Sức khỏe Tài chính và Ổn định Quản trị/Gia tộc. Ma trận kết cục dùng hai trục sau; Uy tín thay đổi nhận xét của hội đồng/báo chí, không tự đổi ô. Không ép ba trục này thành các chỉ số của Case 01.

Brief còn thiếu điểm Uy tín ban đầu, ngưỡng Thấp/Trung bình/Cao và luật tăng điểm. Hãy định nghĩa một rubric nhỏ, rõ, dựa vào chất lượng và độ phù hợp của bằng chứng; ghi số cụ thể, thời điểm áp dụng và ví dụ trong tài liệu builder. Có đường chơi hợp lệ đạt đủ ba mức; không thưởng chỉ vì chọn diagnosis có tên “Mixed”.

Lưu riêng phác đồ người chơi đề nghị và phác đồ được thực thi. PD-A thiếu Uy tín Trung bình hoặc PD-F thiếu Uy tín Cao đều hạ xuống PD-B theo brief. Không disable các lựa chọn bằng ngưỡng điểm lộ trên UI. Lưu snapshot Uy tín khi duyệt; chỉ thông báo việc phê duyệt/hạ kế hoạch dưới dạng sự kiện khi cần, không kèm điểm hay lời chấm. Diễn biến phải dùng phác đồ thực thi. Mất Uy tín về sau không sửa ngược quyết định duyệt trước đó.

TG-C cần luật xác định refinance thành/bại. Chọn mô hình xác định theo state cho MVP; nếu thực sự cần ngẫu nhiên thì phải có seed được lưu cùng ván và có thể kiểm thử. Reload không tạo kết quả mới. Mọi hệ quả được mô tả trong các bước phải có quy tắc tương ứng; không hiển thị một sự kiện thành công nhưng tính điểm như thất bại hoặc ngược lại.

Tái khám chỉ miễn trừ Uy tín khi người chơi viện dẫn evidence mới từ Màn 10 đáp ứng quan hệ được định nghĩa: trực tiếp phản bác diagnosis cũ hoặc cho thấy giả định của treatment không còn đúng. Không miễn tự động chỉ vì đã tới Màn 10. Tính riêng việc đổi diagnosis và treatment; áp dụng chi phí trước khi xét duyệt treatment mới. Không trừ lặp khi render, reload hoặc double-click.

Giữ nguyên các sự kiện đã xảy ra ở Màn 10. Định nghĩa rõ kỳ diễn biến ban đầu và kỳ sau tái khám; kết quả cuối phản ánh lịch sử và thay đổi mới, không áp phác đồ mới ngược về quá khứ. Không cộng toàn bộ điểm hai phác đồ như hai lần điều trị độc lập, cũng không xóa hết hệ quả phác đồ cũ. Thời điểm và các nhóm ưu tiên đã chốt không đổi ở Màn 11.

Điều khoản Houndstooth dựa trên EBITDA, không suy trực tiếp từ điểm Sức khỏe Tài chính. 95% của 792 triệu USD là 752,4 triệu USD. Định nghĩa biến EBITDA, kỳ đo, dấu so sánh và các sự kiện thay đổi nó nếu mô phỏng việc kích hoạt. Phân biệt quyền mua được kích hoạt, quyền được thực hiện và việc David mất kiểm soát. Không tự suy rằng Michael có quyền bán toàn bộ 78% nếu hợp đồng hư cấu chưa quy định như vậy.

Việc PD-E vô hiệu hóa một thỏa thuận chưa kích hoạt phải được ghi là giả định của hợp đồng trong case hư cấu, không phải quy tắc pháp lý chung về Chapter 11. Dùng cờ trạng thái rõ ràng để tránh kết cục vừa vô hiệu hóa thỏa thuận vừa cho cùng thỏa thuận đó tự kích hoạt.

9. Sửa khả năng đạt kết cục và cân bằng phác đồ

Công thức gốc đang không thể đạt đầy đủ ma trận: điểm Tài chính cao nhất là 4 nhưng hàng “Sống sót vững” cần ≥5; khi tài chính sụp đổ, Quản trị cao nhất còn 1 trong khi “Gia tộc đoàn kết” cần ≥3.

Không triển khai nguyên lỗi này. Xây dựng điều chỉnh tối thiểu, ghi rõ công thức cũ → mới và lý do trong builder docs, rồi chứng minh đủ 9 ô bằng các đường chơi hợp lệ. Không cộng điểm nền ngầm hoặc thay ngưỡng chỉ trong UI để làm ma trận có vẻ hoạt động. Xem đề xuất trong bản rà soát như một điểm khởi đầu, không coi đó là cân bằng đã hoàn tất.

Phân biệt cải thiện cash ngắn hạn với sức khỏe dài hạn: PD-B không được tự trở thành phương án ổn định tốt nhất chỉ vì có +3 cash ngắn hạn. Nếu mô tả PD-F có rủi ro thực thi cao nhất thì engine phải có cơ chế tương ứng. Không để PD-F là lựa chọn tự động thắng cả tài chính lẫn quản trị khi đạt ngưỡng Uy tín. Viết vài kịch bản cho thấy đánh đổi giữa các phác đồ, thay vì chỉ thay một trọng số.

Màn tổng kết phải hiện được các thành phần điểm đủ để giải thích kết cục; mọi con số này chỉ xuất hiện sau khi ván đã kết thúc.

10. Tính nhất quán với Case 01

Sửa `DECISIONS.d6` đang thiếu khiến luồng D5 → D6 trả về kết quả sớm. Render màn kết quả theo trạng thái kết thúc hợp lệ, không theo việc không tìm thấy dữ liệu decision. Sửa cả đường CLIENT_WITHDREW và D8 hoàn tất; terminal state không nhận thêm Confirm. Một lượt xác nhận chỉ tạo một chuyển trạng thái và một lần áp dụng hiệu ứng.

Sửa lựa chọn F ở D1 bị xử lý như “Bỏ qua” F của D2; tính độc quyền phải theo cấu hình từng option. Sửa evidence bị hạ từ DISCOVERED/VERIFIED xuống CLUE vì thứ tự lựa chọn. Xác định prerequisite ANY/ALL rõ ràng để manh mối E5 có thể dẫn tới bước xác minh theo đúng thiết kế.

Giữ ba nhóm đánh giá Case 01: Counselor Process, Financial Outcome, Client Experience. Tách dữ kiện đã xảy ra khỏi việc chấm kỹ năng: một khoản tiền đã được event xác nhận thu được không biến mất chỉ vì người chơi không chọn câu trả lời “Reforecast”. Áp dụng event tài chính một lần, rồi tính tác động riêng của phản ứng người chơi. Kiểm tra các điều kiện nguồn tiền liên quan Long, kỳ thu tiền và hạn trả nợ để narrative, state và kết quả không mâu thuẫn.

Hai case dùng chung nguyên tắc điều hướng, quyền truy cập evidence, xác nhận và thời điểm feedback; không bắt buộc chung số bước, loại tiền, rubric hay mô hình kết cục.

11. Nguồn, giả định và tổng kết

SOURCE_USE_MAP và SAMPLE_INPUT_OUTPUT trong brief có nhãn Case #01 và luật của một bản Toys “R” Us cũ: 4 options A–D, điểm 100, diagnosis đúng/sai tuyệt đối và xác suất Chapter 11. Chúng không phải Case 01 Nam Phát hiện tại và không thay thế mô hình CD-A…F / PD-A…F / TG-A…D của Case 02.

Tách dữ liệu lịch sử tham khảo khỏi niên đại đã chuyển thành FY2024–2026/LBO 2015 trong game và lớp gia đình hư cấu. Giữ đơn vị triệu/tỷ USD rõ ràng. Không trình bày một giả định cân bằng game hay tình tiết hư cấu như dữ kiện được nguồn lịch sử xác nhận. Nếu bổ sung khẳng định ngoài tài liệu đã cung cấp, phải kiểm chứng và ghi nguồn/phạm vi sử dụng.

Màn cuối Case 02 có hồ sơ đã mở, CH1/CH2 đã hỏi, evidence đã viện dẫn, diagnosis ban đầu và cuối, treatment đề nghị và thực thi ở từng kỳ, thời điểm, nhóm ưu tiên, ba trục cuối cùng, kết cục, và feedback giải thích liên hệ bằng chứng → quyết định → hệ quả. So sánh lịch sử phải ghi rõ đâu là diễn biến thực tế và đâu là phản thực/hư cấu của game.

12. Tiêu chí kiểm thử và bàn giao

Kiểm thử bằng engine và trình duyệt nếu môi trường hỗ trợ; nếu không chạy được, nói rõ phần nào mới chỉ kiểm tra tĩnh. Không báo “đã test” khi chỉ đọc mã. Tối thiểu cần kiểm chứng:

- Mở/reload tới menu; 01/02 chơi được; 03 không vào được; bản lưu và restart không lẫn case.
- Case 01 đi hết D1–D8; kết thúc sớm hợp lệ vào tổng kết; không dừng giả sau D5; không nhân đôi hiệu ứng ở terminal state.
- Case 02 đi hết Màn 0–12, đúng các giới hạn 3/7, 2/7, 1/7 và 3/7; reload không mở thêm hồ sơ hoặc xem đáp án chưa chọn.
- D1 Case 01 không phụ thuộc thứ tự chọn F; trạng thái evidence không bị hạ; CLUE mở đúng bước xác minh; đường thiếu evidence vẫn kết thúc được.
- Supporting Evidence chỉ chứa dữ kiện có quyền; bấm tên xem chi tiết độc lập với chọn; chặn ID lạ, trùng, chưa thu thập và quá giới hạn khi confirm.
- Chọn thêm evidence không liên quan/phản bác không tăng điểm; E10 không được tính là ủng hộ diagnosis “toàn bộ Unbilled là doanh thu ảo”.
- Chưa có HS-G không lộ bằng chứng hợp đồng đầy đủ; BCTC công khai được đọc mà không mở lại hồ sơ; CD-F dùng đúng điều kiện thống nhất.
- Có đường hợp lệ đạt ba mức Uy tín; A/F hạ đúng sang B; snapshot phê duyệt không đổi hồi tố; TG-C nhất quán khi tải lại.
- Tái khám có/không có bằng chứng mới chịu đúng chi phí; có thể đổi cả diagnosis và treatment; không nhân đôi điểm hoặc xóa sự kiện đã xảy ra.
- Chứng minh được cả 9 ô kết cục bằng lịch sử quyết định hợp lệ, không chỉ tự gán điểm vào state. Nội dung kể chuyện khớp treatment thực thi, EBITDA, quyền kiểm soát và kết quả.
- Trước terminal state không có feedback đánh giá, đáp án, tag gợi ý, live score hoặc debug hiển thị cho người chơi; vẫn đọc được evidence và diễn biến cần thiết.

Bàn giao mã đã chạy được, bản mô tả ngắn các sửa đổi, các giả định mới cho builder, bảng luật điểm cuối cùng, kết quả kiểm thử và giới hạn còn lại. Với những lựa chọn triển khai thông thường, dùng phán đoán và tiếp tục làm; không dừng chỉ để xin xác nhận những gì đã nằm trong phạm vi trên.
