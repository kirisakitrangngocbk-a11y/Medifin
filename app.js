/* MEDIFIN — Toy Kingdom / Case 01
 * Data-driven screen state, evidence provenance, deterministic events and
 * outcome resolution. Player-facing views never render builder metadata.
 */

const SCHEMA_VERSION = 2;
const CANONICAL_CASE_ID = 'case01';
const STORAGE_PREFIX = 'medifin-save-';
const LEGACY_TOY_KEY = 'medifin-case02-v1';
const LEGACY_OLD_KEY = 'medifin-case01-v1';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const deepCopy = (value) => JSON.parse(JSON.stringify(value));
const money = (value, digits = 0) => Number(value).toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const statusLabel = (status) => ({ CLUE: 'Clue', DISCOVERED: 'Đã mở', VERIFIED: 'Đã xác minh', DISPROVED: 'Đã bác bỏ' }[status] || status);

const SCREEN_LABELS = [
  'Tiếp nhận', 'Phòng khám', 'Hồ sơ', 'Câu hỏi', 'BCTC', 'Câu hỏi cuối',
  'Chẩn đoán', 'Điều trị', 'Thời điểm', 'Chuẩn bị', 'Diễn biến', 'Tái khám', 'Kết thúc'
];

const DOSSIERS = {
  'HS-A': {
    id: 'HS-A', title: 'Sales & Customer', scope: 'Doanh thu, traffic và các kênh bán',
    summary: 'Same-store sales, doanh thu theo khu vực và e-commerce.',
    content: [
      'Same-store sales hợp nhất: FY2024 0.0%, FY2025 +0.9%, FY2026 −1.4%. Domestic FY2026 −1.3%; International −1.6%.',
      'Doanh thu hợp nhất FY2025 $11.802bn và FY2026 $11.540bn; e-commerce tăng 11%.',
      'Traffic cửa hàng yếu đi trong khi một phần khách chuyển sang kênh online.'
    ], evidenceIds: ['TK-A-SSS', 'TK-A-CHANNEL'], reputation: 4
  },
  'HS-B': {
    id: 'HS-B', title: 'Stores & Investment', scope: 'Mạng lưới cửa hàng và các chương trình cần vốn',
    summary: 'Renovation, digital, fulfillment, supply chain, trải nghiệm và tồn kho lễ hội.',
    content: [
      'Các chương trình đang tranh vốn gồm store renovation, mobile & web, omnichannel fulfillment, supply chain, customer experience và holiday inventory.',
      'Renovation đã bị gác lại trong ba năm liên tiếp vì các chương trình omnichannel được ưu tiên trước.',
      'Nhiều hạng mục có thể cải thiện vận hành, nhưng tổng vốn đầu tư mỗi năm là hữu hạn.'
    ], evidenceIds: ['TK-B-CAPEX'], reputation: 3
  },
  'HS-C': {
    id: 'HS-C', title: 'Liquidity', scope: 'Cash, hàng tồn kho lễ hội, điều khoản nhà cung cấp và kỳ hạn nợ',
    summary: 'Ảnh chụp thanh khoản FY2026 và các khoản cần chuẩn bị theo mùa.',
    content: [
      'Cash & cash equivalents $566m; accounts and other receivables $255m; merchandise inventory $2.476bn.',
      'Total current assets $3.389bn và property & equipment $3.067bn.',
      'Cash cuối kỳ không phản ánh đầy đủ thanh khoản bán lẻ: holiday inventory, vendor terms và debt maturities đều quan trọng.'
    ], evidenceIds: ['TK-C-CASH', 'TK-C-SEASON'], reputation: 3
  },
  'HS-D': {
    id: 'HS-D', title: 'Capital Structure & Leverage History', scope: 'Nợ, lãi vay và lịch sử giao dịch vốn',
    summary: 'Leverage hiện tại và dòng tiền hoạt động trước giao dịch năm 2015.',
    content: [
      'Total indebtedness khoảng $4.8bn; secured indebtedness khoảng $3.4bn; Adjusted EBITDA FY2026 $792m; operating earnings $460m.',
      'Giao dịch leveraged buyout năm 2015 có giá trị mô phỏng $6.6bn. Sau đó công ty trải qua refinancing, gia hạn kỳ hạn và các vòng tái cấu trúc.',
      'Operating cash flow trước giao dịch: 2012 $575m, 2013 $801m, 2014 $746m.'
    ], evidenceIds: ['TK-D-LEVERAGE', 'TK-D-LBO'], reputation: 5
  },
  'HS-E': {
    id: 'HS-E', title: 'Product & Category Trends', scope: 'Cơ cấu danh mục và chu kỳ licensing',
    summary: 'Đồ chơi truyền thống, entertainment và các yếu tố ngoài quyền kiểm soát.',
    content: [
      'Domestic toy categories excluding entertainment tăng 2.5% SSS; consolidated toy categories excluding entertainment tăng 1.1% SSS.',
      'Các category gắn với entertainment/licensing yếu hơn và phụ thuộc vào lịch phát hành của đối tác.',
      'Một năm không có blockbuster lớn làm phần licensing giảm mạnh hơn phần còn lại của danh mục.'
    ], evidenceIds: ['TK-E-MIX', 'TK-E-LICENSING'], reputation: 3
  },
  'HS-F': {
    id: 'HS-F', title: 'Management Track Record', scope: 'Các sáng kiến ba năm qua và kết quả thực tế',
    summary: 'Renovation, cắt SG&A, digital và tái cấu trúc nợ quốc tế.',
    content: [
      'Store renovation pilot tăng traffic cục bộ nhưng chưa bù chi phí; cắt SG&A giảm chi phí nhưng giảm marketing.',
      'Digital & mobile app mới giúp e-commerce tăng hai chữ số nhưng chưa bù store decline.',
      'Tái cấu trúc một phần nợ quốc tế giảm áp lực ngắn hạn mà không đổi tổng thể leverage.'
    ], evidenceIds: ['TK-F-TRACK'], reputation: 2
  },
  'HS-G': {
    id: 'HS-G', title: 'Governance & Family', scope: 'Cơ cấu sở hữu, thỏa thuận gia đình và thư pháp lý',
    summary: 'Hồ sơ quản trị riêng: Anderson, Michael, Richard và Houndstooth.',
    content: [
      'Gia đình Anderson nắm 78% quyền sở hữu; quỹ đầu tư tư nhân nắm 22%. David là CEO, Michael là em trai, Richard là chú.',
      'Michael có một thỏa thuận hư cấu với Houndstooth Capital: nếu Adjusted EBITDA đo được thấp hơn $752.4m (95% của $792m), quyền mua ưu tiên phần cổ phần được chỉ định trong hợp đồng có thể được kích hoạt.',
      'Richard muốn thanh lý tài sản quốc tế để chia tiền mặt; thư luật sư cho thấy Michael đã chuẩn bị kịch bản gây áp lực lên chủ nợ nếu giành quyền điều hành.',
      'Trong giả định hợp đồng của case, Houndstooth Capital là bên có quyền exercise đối với một tranche 12% cổ phần gia đình được chỉ định; Michael là bên ký/consenting party. Quyền này không bao phủ toàn bộ 78% ownership và chỉ tạo mất kiểm soát khi bước exercise cùng cơ chế chuyển quyền được ghi nhận.',
      'Phạm vi phần cổ phần và cơ chế chuyển quyền là giả định mô phỏng của case; không suy ra chỉ từ tỷ lệ sở hữu.'
    ], evidenceIds: ['TK-G-OWNERSHIP', 'TK-G-CONTRACT', 'TK-G-LETTER'], reputation: 5
  }
};

const EVIDENCE = {
  'TK-A-SSS': { id: 'TK-A-SSS', title: 'Same-store sales', source: 'HS-A · Sales & Customer', acquiredAtScreen: 2, status: 'DISCOVERED', factKey: 'FY2026-SSS', text: 'Same-store sales hợp nhất FY2026 giảm 1.4%, sau FY2025 tăng 0.9%.', relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 3 },
  'TK-A-CHANNEL': { id: 'TK-A-CHANNEL', title: 'Doanh thu theo kênh', source: 'HS-A · Sales & Customer', acquiredAtScreen: 2, status: 'DISCOVERED', factKey: 'FY2026-NET-SALES', text: 'E-commerce tăng 11% trong FY2026, trong khi doanh thu hợp nhất giảm 2.2%.', relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 3 },
  'TK-B-CAPEX': { id: 'TK-B-CAPEX', title: 'Danh sách chương trình vốn', source: 'HS-B · Stores & Investment', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'Renovation, mobile, fulfillment, supply chain, trải nghiệm và holiday inventory cùng tranh vốn hữu hạn.', relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'CONTEXT', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 3 },
  'TK-C-CASH': { id: 'TK-C-CASH', title: 'Cash và tài sản lưu động', source: 'HS-C · Liquidity', acquiredAtScreen: 2, status: 'DISCOVERED', factKey: 'FY2026-CASH', text: 'Cash $566m; inventory $2.476bn; total current assets $3.389bn.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 3 },
  'TK-C-SEASON': { id: 'TK-C-SEASON', title: 'Thanh khoản theo mùa', source: 'HS-C · Liquidity', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'Holiday inventory, vendor terms và debt maturities tạo các yêu cầu thanh khoản khác nhau.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 2 },
  'TK-D-LEVERAGE': { id: 'TK-D-LEVERAGE', title: 'Leverage hiện tại', source: 'HS-D · Capital Structure', acquiredAtScreen: 2, status: 'DISCOVERED', factKey: 'FY2026-EBITDA', text: 'Total indebtedness khoảng $4.8bn, secured indebtedness khoảng $3.4bn, EBITDA $792m.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 4 },
  'TK-D-LBO': { id: 'TK-D-LBO', title: 'Lịch sử giao dịch 2015', source: 'HS-D · Capital Structure', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'LBO mô phỏng $6.6bn và operating cash flow trước giao dịch 2012–2014 lần lượt $575m, $801m, $746m.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 4 },
  'TK-E-MIX': { id: 'TK-E-MIX', title: 'SSS đồ chơi ngoài licensing', source: 'HS-E · Product & Category', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'Domestic +2.5% và consolidated +1.1% SSS ở nhóm loại trừ entertainment.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTRADICTS', F: 'CONTEXT' }, weight: 3 },
  'TK-E-LICENSING': { id: 'TK-E-LICENSING', title: 'Chu kỳ entertainment/licensing', source: 'HS-E · Product & Category', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'Nhóm gắn với entertainment/licensing yếu hơn khi thiếu blockbuster.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'SUPPORTS', F: 'SUPPORTS' }, weight: 3 },
  'TK-F-TRACK': { id: 'TK-F-TRACK', title: 'Kết quả sáng kiến ba năm', source: 'HS-F · Management Track Record', acquiredAtScreen: 2, status: 'DISCOVERED', text: 'Các sáng kiến xử lý từng phần: digital tăng trưởng online, cắt SG&A giảm chi phí và nợ quốc tế được gia hạn.', relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'CONTEXT', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 2 },
  'TK-G-OWNERSHIP': { id: 'TK-G-OWNERSHIP', title: 'Cơ cấu sở hữu Anderson', source: 'HS-G · Governance & Family', acquiredAtScreen: 2, status: 'VERIFIED', text: 'Gia đình Anderson nắm 78% ownership; quỹ đầu tư tư nhân nắm 22%.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'CONTEXT' }, weight: 1 },
  'TK-G-CONTRACT': { id: 'TK-G-CONTRACT', title: 'Điều khoản Houndstooth', source: 'HS-G · Governance & Family', acquiredAtScreen: 2, status: 'VERIFIED', text: 'Hợp đồng hư cấu ghi ngưỡng measured EBITDA < $752.4m cho quyền mua ưu tiên một tranche 12% cổ phần gia đình được chỉ định; Houndstooth là bên exercise, không phải toàn bộ 78% ownership.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'CONTEXT' }, weight: 2 },
  'TK-G-LETTER': { id: 'TK-G-LETTER', title: 'Thư luật sư gia đình', source: 'HS-G · Governance & Family', acquiredAtScreen: 2, status: 'VERIFIED', text: 'Michael đã chuẩn bị kịch bản gây áp lực lên chủ nợ; Richard muốn bán tài sản quốc tế để chia tiền mặt.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'CONTEXT' }, weight: 2 },
  'TK-FS-INCOME': { id: 'TK-FS-INCOME', title: 'Báo cáo kết quả kinh doanh', source: 'BCTC đầy đủ · Màn 4', acquiredAtScreen: 4, status: 'VERIFIED', factKey: 'FY2026-NET-SALES', text: 'Net sales FY2024–2026: $12.361bn, $11.802bn, $11.540bn; operating earnings: $191m, $378m, $460m; net loss attributable FY2026 −$36m.', relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 4 },
  'TK-FS-BALANCE': { id: 'TK-FS-BALANCE', title: 'Bảng cân đối FY2026', source: 'BCTC đầy đủ · Màn 4', acquiredAtScreen: 4, status: 'VERIFIED', factKey: 'FY2026-CASH', text: 'Cash $566m, inventory $2.476bn, property & equipment $3.067bn và stockholders’ deficit khoảng $1.3bn.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 4 },
  'TK-FS-METRICS': { id: 'TK-FS-METRICS', title: 'Operating metrics', source: 'BCTC đầy đủ · Màn 4', acquiredAtScreen: 4, status: 'VERIFIED', factKey: 'FY2026-EBITDA', text: 'Gross margin FY2026 35.6%, SG&A/Sales 30.2%, Adjusted EBITDA $792m và consolidated SSS −1.4%.', relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 4 },
  'TK-CLUE-CHANNEL': { id: 'TK-CLUE-CHANNEL', title: 'Khách đổi kênh', source: 'CH1-A · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Phần lớn traffic giảm phản ánh việc khách chuyển kênh; biên online thấp hơn tại cửa hàng.', relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-RENOVATION': { id: 'TK-CLUE-RENOVATION', title: 'Renovation bị trì hoãn', source: 'CH1-B · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Store renovation bị gác ba năm liên tiếp khi vốn được dồn cho omnichannel.', relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-LIQUIDITY': { id: 'TK-CLUE-LIQUIDITY', title: 'Biên độ covenant', source: 'CH1-C · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Nếu holiday kém 10%, cash hoạt động còn đủ nhưng biên độ với covenant mỏng đi rõ rệt.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-MATURITY': { id: 'TK-CLUE-MATURITY', title: 'Secured notes sắp đáo hạn', source: 'CH1-D · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Một phần secured notes đáo hạn trong 18 tháng; đây là áp lực gần nhất.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-MIX': { id: 'TK-CLUE-MIX', title: 'Biên lợi nhuận danh mục', source: 'CH1-E · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Đồ chơi truyền thống có biên tốt hơn nhưng quy mô nhỏ hơn các nhóm đang yếu.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'SUPPORTS', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-MANAGEMENT': { id: 'TK-CLUE-MANAGEMENT', title: 'Bất đồng điều hành', source: 'CH1-F · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Michael đã mời luật sư chuyên về chuyển giao quyền lực đến một cuộc họp riêng.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-HOUNDSTOOTH': { id: 'TK-CLUE-HOUNDSTOOTH', title: 'Lời đồn về Houndstooth', source: 'CH1-G · Câu hỏi bổ sung', acquiredAtScreen: 3, status: 'CLUE', text: 'Có lời đồn về một quyền mua ưu tiên có điều kiện gắn với EBITDA; nội dung hợp đồng chưa được xác minh ở đây.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'CONTEXT' }, weight: 0 },
  'TK-CLUE-REFINANCE': { id: 'TK-CLUE-REFINANCE', title: 'Áp lực refinance', source: 'CH2-F · Câu hỏi cuối', acquiredAtScreen: 5, status: 'CLUE', text: 'Trong 12 tháng tới, liquidity và refinancing là hai áp lực cần theo dõi; cổ đông gia đình có thể dùng kết quả xấu để chất vấn David.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-HOUNDSTOOTH-TRIGGER': { id: 'TK-CLUE-HOUNDSTOOTH-TRIGGER', title: 'Điều khoản có thể tự kích hoạt', source: 'CH2-G · Câu hỏi cuối', acquiredAtScreen: 5, status: 'CLUE', text: 'Nếu lời đồn là đúng, quyền mua có thể được kích hoạt theo điều kiện hợp đồng; toàn văn chỉ có trong HS-G.', relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'CONTEXT' }, weight: 0 },
  'TK-CLUE-CASH_USE': { id: 'TK-CLUE-CASH_USE', title: 'Các hướng dùng vốn', source: 'CH2-B · Câu hỏi cuối', acquiredAtScreen: 5, status: 'CLUE', text: 'Digital, fulfillment và renovation đều cần vốn; quyết định phân bổ sẽ ảnh hưởng các mảng khác nhau.', relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
  'TK-CLUE-HOLIDAY': { id: 'TK-CLUE-HOLIDAY', title: 'Mùa lễ hội', source: 'CH2-C · Câu hỏi cuối', acquiredAtScreen: 5, status: 'CLUE', text: 'Một số cửa hàng có thể đóng nhưng cắt sâu làm nhỏ sales base; kỳ holiday sẽ phân biệt mức độ chịu đựng thanh khoản.', relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'SUPPORTS', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 }
};

const QUESTIONS_1 = [
  { id: 'CH1-A', title: 'Traffic giảm, e-commerce tăng — khách đang làm gì?', answer: 'Phần lớn khách đang chuyển kênh; biên online thấp hơn tại cửa hàng.', evidence: ['TK-CLUE-CHANNEL'] },
  { id: 'CH1-B', title: 'Chương trình vốn nào bị trì hoãn lâu nhất?', answer: 'Store renovation đã bị gác ba năm liên tiếp vì omnichannel được ưu tiên.', evidence: ['TK-CLUE-RENOVATION'] },
  { id: 'CH1-C', title: 'Holiday kém 10% thì thanh khoản ra sao?', answer: 'Cash hoạt động vẫn đủ, nhưng biên độ an toàn với covenant mỏng đi đáng kể.', evidence: ['TK-CLUE-LIQUIDITY'] },
  { id: 'CH1-D', title: 'Khoản nợ nào đến hạn sớm nhất?', answer: 'Một phần secured notes đáo hạn trong 18 tháng; đây là áp lực gần nhất.', evidence: ['TK-CLUE-MATURITY'] },
  { id: 'CH1-E', title: 'Category nào có biên lợi nhuận tốt hơn?', answer: 'Đồ chơi truyền thống có biên tốt hơn nhưng quy mô nhỏ hơn các nhóm đang yếu.', evidence: ['TK-CLUE-MIX'] },
  { id: 'CH1-F', title: 'Ban lãnh đạo có đồng thuận không?', answer: 'Không hoàn toàn; Michael đã mời một luật sư chuyên về chuyển giao quyền lực.', evidence: ['TK-CLUE-MANAGEMENT'] },
  { id: 'CH1-G', title: 'Có dấu hiệu nào về quyền mua ưu tiên không?', answer: 'Có lời đồn về một quyền mua có điều kiện gắn với EBITDA; nội dung hợp đồng chưa được xác minh.', evidence: ['TK-CLUE-HOUNDSTOOTH'] }
];

const QUESTIONS_2 = [
  { id: 'CH2-A', title: 'Khoản nào khó cắt nhất?', answer: 'Một số nghĩa vụ tài chính có thể refinance nhưng không biến mất; marketing cũng ảnh hưởng sales base.', evidence: [] },
  { id: 'CH2-B', title: 'Có thêm vốn thì dùng vào đâu?', answer: 'Digital, fulfillment và renovation là các hướng đang cạnh tranh vốn.', evidence: ['TK-CLUE-CASH_USE'] },
  { id: 'CH2-C', title: 'Sao không đóng mạnh cửa hàng?', answer: 'Một số nên đóng, nhưng cắt quá sâu làm nhỏ sales base; holiday cần được giữ hàng hóa.', evidence: ['TK-CLUE-HOLIDAY'] },
  { id: 'CH2-D', title: 'Nếu áp lực cạnh tranh giảm thì công ty đã khỏe chưa?', answer: 'Chưa; nợ, thanh khoản và bất đồng gia đình vẫn còn.', evidence: [] },
  { id: 'CH2-E', title: 'Nếu xóa hết nợ thì công ty đã khỏe chưa?', answer: 'Chưa; store base, cạnh tranh và quyền kiểm soát vẫn cần xử lý.', evidence: [] },
  { id: 'CH2-F', title: 'Lo nhất điều gì trong 12 tháng tới?', answer: 'Liquidity và refinancing là hai áp lực cần theo dõi sát.', evidence: ['TK-CLUE-REFINANCE'] },
  { id: 'CH2-G', title: 'Có điều kiện hợp đồng nào cần làm rõ?', answer: (state) => state.selectedDossiers.includes('HS-G') ? 'Hợp đồng quy định measured EBITDA < $752.4m là ngưỡng kích hoạt quyền mua ưu tiên; trigger, exercise và control là ba bước khác nhau.' : 'Có lời đồn về một điều kiện EBITDA, nhưng toàn văn hợp đồng chỉ có thể xác minh trong HS-G.', evidence: (state) => state.selectedDossiers.includes('HS-G') ? [] : ['TK-CLUE-HOUNDSTOOTH-TRIGGER'] }
];

const DIAGNOSES = [
  { id: 'A', title: 'Competitive / E-commerce Disease', desc: 'Áp lực cạnh tranh và chuyển dịch kênh là nguyên nhân trung tâm.', relationships: ['TK-A-SSS', 'TK-A-CHANNEL', 'TK-CLUE-CHANNEL', 'TK-FS-INCOME', 'TK-FS-METRICS'] },
  { id: 'B', title: 'Operating / Store Network Disease', desc: 'Mạng lưới cửa hàng và vốn đầu tư vận hành là nút thắt chính.', relationships: ['TK-B-CAPEX', 'TK-CLUE-RENOVATION', 'TK-F-TRACK'] },
  { id: 'C', title: 'Liquidity Disease', desc: 'Thanh khoản, hàng tồn kho theo mùa và biên covenant là nút thắt chính.', relationships: ['TK-C-CASH', 'TK-C-SEASON', 'TK-CLUE-LIQUIDITY', 'TK-FS-BALANCE'] },
  { id: 'D', title: 'Capital Structure / Financing Disease', desc: 'Cấu trúc vốn và khả năng tái cấp vốn là nguyên nhân trung tâm.', relationships: ['TK-D-LEVERAGE', 'TK-D-LBO', 'TK-CLUE-MATURITY', 'TK-CLUE-REFINANCE', 'TK-FS-INCOME', 'TK-FS-METRICS'] },
  { id: 'E', title: 'Product & Category Disease', desc: 'Cơ cấu danh mục và chu kỳ entertainment/licensing là nút thắt chính.', relationships: ['TK-E-MIX', 'TK-E-LICENSING', 'TK-CLUE-MIX'] },
  { id: 'F', title: 'Mixed Disease', desc: 'Nhiều yếu tố tài chính và vận hành cùng tạo thành một hệ thống rủi ro.', relationships: ['TK-A-SSS', 'TK-B-CAPEX', 'TK-C-CASH', 'TK-D-LEVERAGE', 'TK-D-LBO', 'TK-E-LICENSING', 'TK-F-TRACK', 'TK-FS-INCOME', 'TK-FS-BALANCE', 'TK-FS-METRICS'] }
];

const TREATMENTS = [
  { id: 'A', title: 'Invest to Compete', desc: 'Tập trung vốn vào digital, fulfillment, renovation và trải nghiệm cửa hàng.', effect: 'invest' },
  { id: 'B', title: 'Deep Cost Cutting', desc: 'Giảm SG&A, thu hẹp mạng lưới và giữ tiền mặt trong ngắn hạn.', effect: 'cut' },
  { id: 'C', title: 'Debt Restructuring', desc: 'Đàm phán lại kỳ hạn, lãi suất và thứ tự thanh toán với chủ nợ.', effect: 'debt' },
  { id: 'D', title: 'Asset Sale', desc: 'Bán một phần tài sản quốc tế và phân bổ lại nguồn tiền thu được.', effect: 'asset' },
  { id: 'E', title: 'Chapter 11', desc: 'Đưa công ty vào quy trình tái cấu trúc theo giả định của case.', effect: 'chapter11' },
  { id: 'F', title: 'Combined Restructuring', desc: 'Chạy đồng thời các chương trình vận hành, vốn và quản trị.', effect: 'combined' }
];

const TIMINGS = [
  { id: 'A', title: 'Thực hiện ngay', desc: 'Bắt đầu kế hoạch với dữ liệu holiday hiện có.' },
  { id: 'B', title: 'Sau holiday season', desc: 'Chờ dữ liệu mùa cao điểm rồi công bố kế hoạch.' },
  { id: 'C', title: 'Refinance thử trước', desc: 'Kiểm tra khả năng tái cấp vốn trước khi chọn bước tiếp theo.' },
  { id: 'D', title: 'Chờ sáu tháng', desc: 'Dành thêm thời gian quan sát các sáng kiến vận hành.' }
];

const PRIORITIES = [
  { id: 'Suppliers', title: 'Suppliers', desc: 'Đàm phán điều khoản trước khi công bố kế hoạch.' },
  { id: 'Employees', title: 'Employees', desc: 'Trấn an nội bộ và giữ nhân sự chủ chốt.' },
  { id: 'Customers', title: 'Customers', desc: 'Giữ niềm tin mua sắm trong giai đoạn thay đổi.' },
  { id: 'Creditors', title: 'Creditors', desc: 'Đàm phán sớm các điều khoản nợ.' },
  { id: 'Landlords', title: 'Landlords', desc: 'Giữ quan hệ thuê mặt bằng.' },
  { id: 'Holiday Inventory', title: 'Holiday Inventory', desc: 'Đảm bảo hàng hóa cho mùa cao điểm.' },
  { id: 'Governance & Family', title: 'Governance & Family', desc: 'Báo trước và giữ ổn định đội ngũ điều hành gia đình.' }
];

const REASSESS_MODES = [
  { id: 'KEEP', title: 'Giữ nguyên', desc: 'Giữ diagnosis và treatment đã được áp dụng.' },
  { id: 'DIAGNOSIS', title: 'Đổi diagnosis', desc: 'Cập nhật cách giải thích căn bệnh theo dữ kiện mới.' },
  { id: 'TREATMENT', title: 'Đổi treatment', desc: 'Đổi phác đồ cho kỳ tiếp theo.' },
  { id: 'BOTH', title: 'Đổi cả hai', desc: 'Cập nhật diagnosis và treatment cho kỳ tiếp theo.' }
];

function makeInitialState() {
  return {
    caseId: CANONICAL_CASE_ID, caseIdentity: 'toy-kingdom-anderson', schemaVersion: SCHEMA_VERSION,
    status: 'IN_PROGRESS', currentScreen: 0, confirmedScreens: [], transitionIds: [], answeredQuestions: [], selectedDossiers: [], selectedQuestions1: [], selectedQuestion2: null,
    draftSelection: { dossiers: [], questions1: [], question2: null, diagnosis: null, diagnosisEvidenceIds: [], treatment: null, timing: null, priorities: [], reassessmentMode: null, reassessmentDiagnosis: null, reassessmentTreatment: null, reassessmentEvidenceIds: [] },
    decisionHistory: [], evidenceLedger: Object.fromEntries(Object.keys(EVIDENCE).map((id) => [id, { status: 'LOCKED', provenance: [] }])),
    eventLedger: [], eventCursor: 0, eventSequence: [],
    reputation: 50, proposedTreatment: null, implementedTreatment: null, approvalReputationSnapshot: null,
    timing: null, priorities: [], financialState: { cash: 566, debt: 4800, ebitda: 792, operationalContinuity: 70, shortTermLiquidity: 50, longTermFinancialHealth: 50, refinancingStatus: 'NOT_TESTED', executionSuccess: null, newRisks: [] },
    governanceState: { score: 50, disclosure: false, boardPreparation: false, familyEvents: [], houndstoothHandled: false },
    familyState: { ownership: { anderson: 78, fund: 22 }, controlLost: false },
    houndstoothState: { referenceEbitda: 792, measuredEbitda: 792, measurementPeriod: 'Period 1 FY2026 simulation', triggerThreshold: 752.4, optionHolder: 'Houndstooth Capital', consentingSignatory: 'Michael Anderson', designatedTranchePct: 12, triggerStatus: false, exercisedStatus: false, controlLost: false, agreementVoided: false },
    assumptions: [], invalidatedAssumptions: [], invalidatedAssumptionIds: [], reassessment: { mode: null, evidenceIds: [], applied: false, changedDiagnosis: false, changedTreatment: false, costApplied: 0 },
    finalOutcome: null, finalFeedback: null
  };
}

function isValidState(candidate) {
  const draft = candidate?.draftSelection;
  const financial = candidate?.financialState;
  const houndstooth = candidate?.houndstoothState;
  return Boolean(candidate && candidate.caseId === CANONICAL_CASE_ID && candidate.caseIdentity === 'toy-kingdom-anderson' && Number(candidate.schemaVersion) === SCHEMA_VERSION && typeof candidate.currentScreen === 'number' && draft && Array.isArray(draft.dossiers) && Array.isArray(draft.questions1) && Array.isArray(draft.priorities) && Array.isArray(draft.diagnosisEvidenceIds) && Array.isArray(draft.reassessmentEvidenceIds) && candidate.evidenceLedger && Array.isArray(candidate.confirmedScreens) && Array.isArray(candidate.eventLedger) && financial && Number.isFinite(financial.cash) && Number.isFinite(financial.debt) && Number.isFinite(financial.ebitda) && Array.isArray(financial.newRisks) && candidate.governanceState && candidate.familyState && houndstooth && Number.isFinite(houndstooth.triggerThreshold));
}

function migrateLegacySave() {
  let oldToy = null;
  try { oldToy = JSON.parse(localStorage.getItem(LEGACY_TOY_KEY)); } catch { oldToy = null; }
  const legacyIdentity = `${oldToy?.caseIdentity || ''} ${oldToy?.caseName || ''}`.toLowerCase();
  const legacyCaseId = String(oldToy?.caseId || '').toLowerCase();
  const legacyLooksNamPhat = legacyIdentity.includes('nam phat') || legacyIdentity.includes('nam-phat');
  const legacyLooksToy = !legacyIdentity.trim() || legacyIdentity.includes('toy') || ['case02', 'case_02'].includes(legacyCaseId);
  if (oldToy && !legacyLooksNamPhat && legacyLooksToy) {
    const next = makeInitialState();
    const compatibleShape = oldToy.draftSelection && oldToy.evidenceLedger && oldToy.financialState && Array.isArray(oldToy.confirmedScreens);
    if (compatibleShape) {
      if (Number.isFinite(oldToy.currentScreen)) next.currentScreen = clamp(oldToy.currentScreen, 0, 12);
      if (Array.isArray(oldToy.history)) next.decisionHistory = deepCopy(oldToy.history);
    }
    next.migratedFrom = LEGACY_TOY_KEY;
    localStorage.setItem(storageKey(), JSON.stringify(next));
    localStorage.removeItem(LEGACY_TOY_KEY);
    localStorage.removeItem(LEGACY_OLD_KEY);
    return next;
  }
  // The old canonical key belonged to Nam Phát. Remove it rather than ever
  // allowing a numbering collision to be interpreted as Toy Kingdom.
  try { if (localStorage.getItem(LEGACY_OLD_KEY) !== null) localStorage.removeItem(LEGACY_OLD_KEY); } catch { /* malformed legacy data is ignored */ }
  return null;
}

function storageKey() { return `${STORAGE_PREFIX}${CANONICAL_CASE_ID}-v${SCHEMA_VERSION}`; }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()));
    if (isValidState(saved)) {
      if (!Array.isArray(saved.invalidatedAssumptionIds)) saved.invalidatedAssumptionIds = [...(saved.invalidatedAssumptions || [])];
      if (saved.currentScreen >= 12 && saved.status !== 'COMPLETED') saved.currentScreen = 11;
      return saved;
    }
  } catch { /* corrupted save is reset safely */ }
  return migrateLegacySave() || makeInitialState();
}
function saveState() {
  try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch { /* gameplay remains usable without storage */ }
  const el = document.getElementById('saveStatus'); if (el) { el.innerHTML = '<i></i> Saved just now'; window.setTimeout(() => { el.innerHTML = '<i></i> Auto-saved'; }, 1800); }
}
function hasSave() { try { return isValidState(JSON.parse(localStorage.getItem(storageKey()))); } catch { return false; } }
function clearCaseSave() { try { localStorage.removeItem(storageKey()); localStorage.removeItem(LEGACY_TOY_KEY); localStorage.removeItem(LEGACY_OLD_KEY); } catch { /* no-op */ } }

function currentEvidence(state, id) {
  const item = EVIDENCE[id]; const ledger = state.evidenceLedger[id];
  return item ? { ...item, ...(ledger || {}) } : null;
}
function evidenceStatus(state, id) { return state.evidenceLedger[id]?.status || 'LOCKED'; }
function citableEvidence(state) { return Object.keys(EVIDENCE).filter((id) => ['DISCOVERED', 'VERIFIED'].includes(evidenceStatus(state, id))); }
function revealEvidence(state, ids, status = 'DISCOVERED', provenance = 'case') {
  (ids || []).forEach((id) => {
    if (!EVIDENCE[id] || !state.evidenceLedger[id]) return;
    const entry = state.evidenceLedger[id];
    const rank = { LOCKED: 0, CLUE: 1, DISCOVERED: 2, VERIFIED: 3, DISPROVED: 4 };
    // Evidence status is monotonic. A disproved fact stays disproved unless
    // a future replacement-contract mechanic is added explicitly.
    if (entry.status === 'DISPROVED' && status !== 'DISPROVED') return;
    if (rank[status] < rank[entry.status]) return;
    entry.status = status;
    if (!entry.provenance.includes(provenance)) entry.provenance.push(provenance);
  });
}
function hasDossier(state, id) { return state.draftSelection.dossiers.includes(id); }
function getDiagnosis(id) { return DIAGNOSES.find((x) => x.id === id); }
function getTreatment(id) { return TREATMENTS.find((x) => x.id === id); }
function getTiming(id) { return TIMINGS.find((x) => x.id === id); }
function getQuestion1(id) { return QUESTIONS_1.find((x) => x.id === id); }
function getQuestion2(id) { return QUESTIONS_2.find((x) => x.id === id); }
function reputationTier(value) { return value < 40 ? 'LOW' : value < 70 ? 'MEDIUM' : 'HIGH'; }
function reputationLabel(value) { return ({ LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao' })[reputationTier(value)]; }
function addReputation(state, delta) { state.reputation = clamp(state.reputation + delta); }

function relationshipFor(state, diagnosisId, evidenceId) {
  const e = EVIDENCE[evidenceId]; return e?.relationships?.[diagnosisId] || 'UNRELATED';
}
function distinctEvidenceIds(ids) {
  const seen = new Set();
  return (ids || []).filter((id) => {
    const key = EVIDENCE[id]?.factKey || id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
function validateEvidenceSelection(state, ids, diagnosisId, allowEmpty = false) {
  const list = Array.isArray(ids) ? ids : [];
  if (new Set(list).size !== list.length) return 'Evidence không được lặp lại.';
  if (list.length > 3) return 'Có thể dùng tối đa 3 evidence.';
  if (list.some((id) => !EVIDENCE[id] || !citableEvidence(state).includes(id))) return 'Chỉ được dùng evidence đã mở và đủ trạng thái xác minh.';
  if (!allowEmpty && list.length === 0 && citableEvidence(state).length > 0) return 'Hãy chọn ít nhất một evidence.';
  return '';
}
function validateScreen(state) {
  const d = state.draftSelection;
  if (state.currentScreen === 2 && (d.dossiers.length !== 3 || d.dossiers.some((id) => !DOSSIERS[id]))) return 'Hãy chọn đúng 3 hồ sơ.';
  if (state.currentScreen === 3 && (d.questions1.length !== 2 || d.questions1.some((id) => !getQuestion1(id)))) return 'Hãy chọn đúng 2 câu hỏi.';
  if (state.currentScreen === 5 && (!d.question2 || !getQuestion2(d.question2))) return 'Hãy chọn một câu hỏi.';
  if (state.currentScreen === 6) {
    if (!d.diagnosis || !getDiagnosis(d.diagnosis)) return 'Hãy chọn một chẩn đoán.';
    return validateEvidenceSelection(state, d.diagnosisEvidenceIds, d.diagnosis, false);
  }
  if (state.currentScreen === 7 && (!d.treatment || !getTreatment(d.treatment))) return 'Hãy chọn một phác đồ.';
  if (state.currentScreen === 8 && (!d.timing || !getTiming(d.timing))) return 'Hãy chọn một thời điểm.';
  if (state.currentScreen === 9 && (d.priorities.length !== 3 || d.priorities.some((id) => !PRIORITIES.some((p) => p.id === id)))) return 'Hãy chọn đúng 3 nhóm ưu tiên.';
  if (state.currentScreen === 11) {
    if (!d.reassessmentMode) return 'Hãy chọn cách tái khám.';
    const mode = d.reassessmentMode;
    if (['DIAGNOSIS', 'BOTH'].includes(mode) && (!d.reassessmentDiagnosis || !getDiagnosis(d.reassessmentDiagnosis))) return 'Hãy chọn diagnosis mới.';
    if (['TREATMENT', 'BOTH'].includes(mode) && (!d.reassessmentTreatment || !getTreatment(d.reassessmentTreatment))) return 'Hãy chọn treatment mới.';
    if (['DIAGNOSIS', 'BOTH'].includes(mode)) return validateEvidenceSelection(state, d.reassessmentEvidenceIds, d.reassessmentDiagnosis, false);
  }
  return '';
}

function applyDiagnosisReasoning(state, diagnosisId, ids) {
  const countedIds = distinctEvidenceIds(ids);
  const relationships = countedIds.map((id) => relationshipFor(state, diagnosisId, id));
  const support = relationships.filter((r) => r === 'SUPPORTS').length;
  const contradiction = relationships.filter((r) => r === 'CONTRADICTS').length;
  const unrelated = relationships.filter((r) => r === 'UNRELATED').length;
  const context = relationships.filter((r) => r === 'CONTEXT').length;
  const diagnosis = getDiagnosis(diagnosisId);
  const mixedEligible = hasDossier(state, 'HS-D') && ['HS-A', 'HS-B', 'HS-E', 'HS-F'].some((id) => hasDossier(state, id));
  const evidenceIds = countedIds;
  let delta = support * 4 - contradiction * 6 - unrelated * 2 + Math.min(2, context);
  if (diagnosisId === 'F' && !mixedEligible) delta -= 5;
  if (!countedIds.length) delta -= 8;
  if (support === 0 && countedIds.length) delta -= 5;
  if (diagnosisId === 'F' && mixedEligible && support >= 2) delta += 3;
  addReputation(state, delta);
  state.planReasoning = { diagnosisId, support, contradiction, unrelated, context, mixedEligible, evidenceIds, selectedEvidenceIds: [...ids] };
}

function resolveRefinancing(input) {
  const state = input;
  const leverage = state.financialState.debt / Math.max(1, state.financialState.ebitda);
  const hasDebtEvidence = citableEvidence(state).some((id) => ['TK-D-LEVERAGE', 'TK-D-LBO', 'TK-CLUE-MATURITY', 'TK-CLUE-REFINANCE'].includes(id));
  const credibility = state.reputation >= 60;
  const score = (state.timing === 'C' ? 1 : 0) + (hasDebtEvidence ? 1 : 0) + (credibility ? 1 : 0) + (leverage < 5.8 ? 1 : 0);
  return { success: score >= 3, score, leverage, reason: score >= 3 ? 'Các điều kiện hồ sơ và khả năng trả nợ đủ để tiếp tục đàm phán.' : 'Leverage và hồ sơ hiện tại chưa tạo được vị thế refinance đủ chắc.' };
}

function applyTreatmentExecution(state) {
  const proposed = getTreatment(state.proposedTreatment);
  const f = state.financialState;
  if (!proposed) return;
  const prepared = state.priorities;
  const has = (key) => prepared.includes(key);
  const execution = {
    invest: has('Customers') && has('Holiday Inventory') && has('Employees'),
    cut: true,
    debt: has('Creditors'),
    asset: has('Customers') || has('Governance & Family'),
    chapter11: has('Suppliers') && has('Creditors'),
    combined: has('Creditors') && has('Suppliers') && has('Governance & Family')
  }[proposed.effect];
  f.executionSuccess = Boolean(execution);
  if (proposed.effect === 'invest') { f.cash -= execution ? 180 : 260; f.ebitda += execution ? 34 : 5; f.operationalContinuity += execution ? 18 : 2; f.shortTermLiquidity -= 10; f.longTermFinancialHealth += execution ? 18 : 5; }
  if (proposed.effect === 'cut') { f.cash += 190; f.ebitda -= 46; f.operationalContinuity -= 18; f.shortTermLiquidity += 22; f.longTermFinancialHealth -= 16; }
  if (proposed.effect === 'debt') { f.debt -= execution ? 620 : 120; f.cash += execution ? 90 : 15; f.shortTermLiquidity += execution ? 12 : 2; f.longTermFinancialHealth += execution ? 15 : 3; }
  if (proposed.effect === 'asset') { f.cash += execution ? 620 : 420; f.ebitda -= execution ? 88 : 65; f.operationalContinuity -= execution ? 10 : 15; f.shortTermLiquidity += 27; f.longTermFinancialHealth -= 6; }
  if (proposed.effect === 'chapter11') { f.debt -= execution ? 1750 : 900; f.cash -= execution ? 130 : 240; f.operationalContinuity += execution ? 4 : -18; f.shortTermLiquidity += execution ? 8 : -10; f.longTermFinancialHealth += execution ? 16 : -6; }
  if (proposed.effect === 'combined') { f.cash += execution ? 120 : -160; f.debt -= execution ? 850 : 260; f.ebitda += execution ? 26 : -22; f.operationalContinuity += execution ? 16 : -12; f.shortTermLiquidity += execution ? 15 : -8; f.longTermFinancialHealth += execution ? 21 : -12; }
  if (!has('Holiday Inventory')) f.newRisks.push('HOLIDAY_SHORTFALL');
  if (!has('Governance & Family')) f.newRisks.push('FAMILY_ESCALATION');
  if (state.timing === 'D') { f.cash -= 260; f.shortTermLiquidity -= 18; f.newRisks.push('RUNWAY_DELAY'); }
  if (state.timing === 'B') { f.cash -= 80; f.shortTermLiquidity -= 8; }
  if (state.timing === 'C') { f.refinancingStatus = resolveRefinancing(state).success ? 'SUCCESS' : 'FAILED'; if (f.refinancingStatus === 'SUCCESS') { f.debt -= 320; f.shortTermLiquidity += 14; } else { f.newRisks.push('REFINANCE_SIGNAL'); f.shortTermLiquidity -= 10; } }
  f.cash = Math.max(0, f.cash);
  f.operationalContinuity = clamp(f.operationalContinuity, 0, 100);
  f.shortTermLiquidity = clamp(f.shortTermLiquidity, 0, 100);
  f.longTermFinancialHealth = clamp(f.longTermFinancialHealth, 0, 100);
}

function applyPeriod2Treatment(state) {
  const treatment = getTreatment(state.finalImplementedTreatment); const f = state.financialState;
  if (!treatment || state.finalImplementedTreatment === state.implementedTreatment) return;
  const before = { cash: f.cash, debt: f.debt, ebitda: f.ebitda, operationalContinuity: f.operationalContinuity, longTermFinancialHealth: f.longTermFinancialHealth };
  if (treatment.effect === 'invest') { f.cash -= 80; f.ebitda += 20; f.operationalContinuity += 8; f.longTermFinancialHealth += 8; }
  if (treatment.effect === 'cut') { f.cash += 100; f.ebitda -= 30; f.operationalContinuity -= 10; f.longTermFinancialHealth -= 10; }
  if (treatment.effect === 'debt') { f.debt -= state.priorities.includes('Creditors') ? 300 : 50; f.longTermFinancialHealth += 8; }
  if (treatment.effect === 'asset') { f.cash += 300; f.ebitda -= 45; f.operationalContinuity -= 8; f.longTermFinancialHealth -= 4; }
  if (treatment.effect === 'chapter11') { f.debt -= 800; f.cash -= 120; f.longTermFinancialHealth += 10; }
  if (treatment.effect === 'combined') { f.cash += 50; f.debt -= 450; f.ebitda += 16; f.operationalContinuity += 8; f.longTermFinancialHealth += 12; }
  f.cash = Math.max(0, f.cash); f.operationalContinuity = clamp(f.operationalContinuity); f.longTermFinancialHealth = clamp(f.longTermFinancialHealth);
  state.period2TreatmentState = { before, after: { cash: f.cash, debt: f.debt, ebitda: f.ebitda, operationalContinuity: f.operationalContinuity, longTermFinancialHealth: f.longTermFinancialHealth }, implementedTreatment: state.finalImplementedTreatment };
  state.houndstoothState.measurementPeriod = 'Period 2 post-reassessment';
  state.eventLedger.push({ id: 'period2-treatment', period: 'Period 2', title: 'Reassessment implementation', text: `Phác đồ kỳ tiếp theo ${state.finalImplementedTreatment} bắt đầu trên state còn lại của Period 1.`, screen: 11 });
}

function buildEventSequence(state) {
  const f = state.financialState; const t = getTreatment(state.implementedTreatment); const has = (key) => state.priorities.includes(key);
  const updates = [
    { title: 'Sales Update', text: has('Customers') ? 'Customer communications giữ được nhịp mua sắm trong giai đoạn chuyển kế hoạch.' : 'Một số khách hàng chuyển sang đối thủ vì lo ngại kế hoạch tái cấu trúc.', evidence: ['TK-EVENT-SALES'] },
    { title: 'Vendor Update', text: has('Suppliers') ? 'Nhà cung cấp duy trì điều khoản hiện tại sau khi được thông báo kế hoạch.' : 'Một số nhà cung cấp yêu cầu điều khoản thanh toán ngắn hơn.', evidence: ['TK-EVENT-VENDOR'] },
    { title: 'Liquidity Update', text: `Cash mô phỏng sau bước triển khai là $${money(f.cash)}m; short-term liquidity đang ở mức ${f.shortTermLiquidity >= 60 ? 'có dư địa' : f.shortTermLiquidity >= 35 ? 'hạn chế' : 'rất hẹp'}.`, evidence: ['TK-EVENT-LIQUIDITY'] },
    { title: 'Store Update', text: t?.effect === 'invest' || t?.effect === 'combined' ? 'Một phần renovation và fulfillment được khởi động theo nguồn vốn đã phân bổ.' : 'Renovation tiếp tục bị trì hoãn trong kỳ mô phỏng.', evidence: ['TK-EVENT-STORE'] },
    { title: 'Digital Update', text: t?.effect === 'cut' ? 'Digital vẫn tăng nhưng không đủ bù giảm traffic cửa hàng.' : 'E-commerce tiếp tục tăng, với biên lợi nhuận thấp hơn cửa hàng.', evidence: ['TK-EVENT-DIGITAL'] },
    { title: 'Debt Update', text: f.refinancingStatus === 'SUCCESS' ? 'Một nhóm chủ nợ đồng ý gia hạn theo hồ sơ đã đàm phán.' : 'Điều kiện nợ và giá vốn chưa cải thiện đủ để tạo dư địa mới.', evidence: ['TK-EVENT-DEBT'] },
    { title: 'Family / Board Update', text: has('Governance & Family') ? 'David có thêm thời gian trình bày kế hoạch với cổ đông gia đình; Michael và Richard vẫn yêu cầu cơ chế giám sát.' : 'Michael và Richard tổ chức trao đổi riêng và chuẩn bị phương án bỏ phiếu phản đối.', evidence: ['TK-EVENT-BOARD'] }
  ];
  return updates;
}

function updateHoundstooth(state) {
  const h = state.houndstoothState; h.measuredEbitda = Number(state.financialState.ebitda.toFixed(2));
  if (h.agreementVoided) { h.triggerStatus = false; h.exercisedStatus = false; h.controlLost = false; state.familyState.controlLost = false; return; }
  // The contractual right exists in the case whether or not the player
  // opened HS-G. Access control limits what the player knows; it does not
  // make the underlying EBITDA trigger disappear.
  h.triggerStatus = h.measuredEbitda < h.triggerThreshold;
  if (h.triggerStatus && !state.priorities.includes('Governance & Family') && !state.financialState.newRisks.includes('HOUNDSTOOTH_PRESSURE')) {
    // A triggered contractual right creates an immediate financing/stakeholder
    // shock in the simulation; it is a financial state event, not a score bonus.
    state.financialState.cash = Math.max(0, state.financialState.cash - 300);
    state.financialState.ebitda -= 35;
    state.financialState.operationalContinuity -= 18;
    state.financialState.shortTermLiquidity -= 15;
    state.financialState.newRisks.push('HOUNDSTOOTH_PRESSURE');
  }
  h.exercisedStatus = Boolean(h.triggerStatus && !state.priorities.includes('Governance & Family'));
  h.controlLost = Boolean(h.exercisedStatus && state.financialState.operationalContinuity < 45);
  state.familyState.controlLost = h.controlLost;
}

function addEventEvidence(state, event) {
  const map = {
    'TK-EVENT-SALES': { title: 'Diễn biến doanh thu', source: 'Màn 10 · Sales Update', text: event.text, relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-VENDOR': { title: 'Diễn biến nhà cung cấp', source: 'Màn 10 · Vendor Update', text: event.text, relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'SUPPORTS', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-LIQUIDITY': { title: 'Diễn biến thanh khoản', source: 'Màn 10 · Liquidity Update', text: event.text, relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-STORE': { title: 'Diễn biến cửa hàng', source: 'Màn 10 · Store Update', text: event.text, relationships: { A: 'CONTEXT', B: 'SUPPORTS', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-DIGITAL': { title: 'Diễn biến digital', source: 'Màn 10 · Digital Update', text: event.text, relationships: { A: 'SUPPORTS', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-DEBT': { title: 'Diễn biến khoản nợ', source: 'Màn 10 · Debt Update', text: event.text, relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'SUPPORTS', D: 'SUPPORTS', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 },
    'TK-EVENT-BOARD': { title: 'Diễn biến hội đồng', source: 'Màn 10 · Family / Board Update', text: event.text, relationships: { A: 'CONTEXT', B: 'CONTEXT', C: 'CONTEXT', D: 'CONTEXT', E: 'CONTEXT', F: 'SUPPORTS' }, weight: 1 }
  };
  (event.evidence || []).forEach((id) => {
    if (!EVIDENCE[id] && map[id]) EVIDENCE[id] = { id, acquiredAtScreen: 10, status: 'DISCOVERED', ...map[id] };
    // Event evidence is created after the initial ledger snapshot. Add its
    // ledger entry before revealing it so it becomes citable in M11.
    if (EVIDENCE[id] && !state.evidenceLedger[id]) state.evidenceLedger[id] = { status: 'LOCKED', provenance: [] };
    revealEvidence(state, [id], 'DISCOVERED', 'Màn 10');
  });
}

function applyScreen(state) {
  const screen = state.currentScreen; const d = state.draftSelection;
  if (screen === 0 || screen === 1) return;
  if (screen === 2) {
    state.selectedDossiers = [...d.dossiers];
    d.dossiers.forEach((id) => { const dossier = DOSSIERS[id]; revealEvidence(state, dossier.evidenceIds, id === 'HS-G' ? 'VERIFIED' : 'DISCOVERED', id); addReputation(state, dossier.reputation - 2); });
    state.governanceState.disclosure = d.dossiers.includes('HS-G');
  }
  if (screen === 3) {
    state.selectedQuestions1 = [...d.questions1];
    state.answeredQuestions = d.questions1.map((id) => { const q = getQuestion1(id); return { id, answer: q.answer }; });
    d.questions1.forEach((id) => { const q = getQuestion1(id); revealEvidence(state, q.evidence, 'CLUE', id); });
    addReputation(state, d.questions1.includes('CH1-F') ? -2 : 2);
  }
  if (screen === 4) {
    revealEvidence(state, ['TK-FS-INCOME', 'TK-FS-BALANCE', 'TK-FS-METRICS'], 'VERIFIED', 'BCTC Màn 4');
  }
  if (screen === 5) {
    const q = getQuestion2(d.question2); state.selectedQuestion2 = d.question2;
    state.answeredQuestions = [...state.answeredQuestions, { id: d.question2, answer: typeof q.answer === 'function' ? q.answer(state) : q.answer }];
    revealEvidence(state, typeof q.evidence === 'function' ? q.evidence(state) : q.evidence, d.question2 === 'CH2-G' && hasDossier(state, 'HS-G') ? 'VERIFIED' : 'CLUE', d.question2);
    addReputation(state, ['CH2-F', 'CH2-G'].includes(d.question2) ? 2 : 0);
  }
  if (screen === 6) {
    state.initialDiagnosis = d.diagnosis; state.initialDiagnosisEvidenceIds = [...d.diagnosisEvidenceIds];
    applyDiagnosisReasoning(state, d.diagnosis, d.diagnosisEvidenceIds);
  }
  if (screen === 7) {
    state.proposedTreatment = d.treatment; state.approvalReputationSnapshot = state.reputation;
    const tier = reputationTier(state.approvalReputationSnapshot);
    state.implementedTreatment = (d.treatment === 'A' && tier === 'LOW') || (d.treatment === 'F' && tier !== 'HIGH') ? 'B' : d.treatment;
    state.treatmentApproval = { proposedTreatment: d.treatment, implementedTreatment: state.implementedTreatment, approvalReputationSnapshot: state.approvalReputationSnapshot };
    state.assumptions = [`${state.implementedTreatment} thực thi trong Period 1`];
  }
  if (screen === 8) {
    state.timing = d.timing;
    if (d.timing === 'C') { const result = resolveRefinancing(state); state.financialState.refinancingStatus = result.success ? 'SUCCESS' : 'FAILED'; state.refinancingResult = result; }
  }
  if (screen === 9) {
    state.priorities = [...d.priorities];
    applyTreatmentExecution(state);
    state.eventSequence = buildEventSequence(state); state.eventCursor = 0;
    updateHoundstooth(state);
    if (state.implementedTreatment === 'E' && !state.houndstoothState.triggerStatus) state.houndstoothState.agreementVoided = true;
    state.governanceState.boardPreparation = state.priorities.includes('Governance & Family');
  }
  if (screen === 10) {
    const event = state.eventSequence[state.eventCursor];
    if (event && !state.eventLedger.some((x) => x.id === `period1-${state.eventCursor}`)) {
      state.eventLedger.push({ id: `period1-${state.eventCursor}`, period: 'Period 1', title: event.title, text: event.text, screen: 10 }); addEventEvidence(state, event);
    }
    if (state.eventCursor < state.eventSequence.length - 1) { state.eventCursor += 1; return; }
    state.currentScreen = 11; return;
  }
  if (screen === 11) {
    const mode = d.reassessmentMode; state.reassessment = { mode, evidenceIds: [...d.reassessmentEvidenceIds], applied: true, changedDiagnosis: ['DIAGNOSIS', 'BOTH'].includes(mode), changedTreatment: ['TREATMENT', 'BOTH'].includes(mode), costApplied: 0 };
    const reassessRelationships = d.reassessmentEvidenceIds.map((id) => relationshipFor(state, d.reassessmentDiagnosis || state.initialDiagnosis, id));
    const hasNewBasis = d.reassessmentEvidenceIds.some((id) => state.evidenceLedger[id]?.provenance.includes('Màn 10') && (reassessRelationships.includes('CONTRADICTS') || id === 'TK-EVENT-LIQUIDITY' || id === 'TK-EVENT-DEBT'));
    if (mode !== 'KEEP' && !hasNewBasis) { addReputation(state, -5); state.reassessment.costApplied = 5; }
    if (mode !== 'KEEP' && hasNewBasis) {
      state.reassessment.costApplied = 0;
      state.invalidatedAssumptions = [...state.assumptions];
      state.invalidatedAssumptionIds = [...state.assumptions];
    }
    if (['DIAGNOSIS', 'BOTH'].includes(mode)) { state.finalDiagnosis = d.reassessmentDiagnosis; state.finalDiagnosisEvidenceIds = [...d.reassessmentEvidenceIds]; }
    else { state.finalDiagnosis = state.initialDiagnosis; state.finalDiagnosisEvidenceIds = [...state.initialDiagnosisEvidenceIds]; }
    if (['TREATMENT', 'BOTH'].includes(mode)) {
      state.finalProposedTreatment = d.reassessmentTreatment;
      state.reassessment.approvalReputationSnapshot = state.reputation;
      const reassessTier = reputationTier(state.reassessment.approvalReputationSnapshot);
      state.finalImplementedTreatment = (d.reassessmentTreatment === 'A' && reassessTier === 'LOW') || (d.reassessmentTreatment === 'F' && reassessTier !== 'HIGH') ? 'B' : d.reassessmentTreatment;
      state.reassessment.treatmentApproval = { proposedTreatment: d.reassessmentTreatment, implementedTreatment: state.finalImplementedTreatment, approvalReputationSnapshot: state.reassessment.approvalReputationSnapshot };
    } else { state.finalProposedTreatment = state.proposedTreatment; state.finalImplementedTreatment = state.implementedTreatment; }
    applyPeriod2Treatment(state);
    state.governanceState.houndstoothHandled = state.priorities.includes('Governance & Family') || hasDossier(state, 'HS-G');
    state.currentScreen = 12;
    finalize(state);
  }
}

function calculateFinancialOutcome(state) {
  const f = state.financialState;
  const liquidity = clamp((f.cash / 1000) * 45 + f.shortTermLiquidity * .55);
  const debtLoad = clamp(100 - (f.debt / 55));
  const continuity = f.operationalContinuity;
  const ebitda = clamp((f.ebitda / 850) * 100);
  const execution = f.executionSuccess === true ? 100 : f.executionSuccess === false ? 20 : 50;
  const longTermHealth = clamp(f.longTermFinancialHealth);
  const refinancing = f.refinancingStatus === 'SUCCESS' ? 100 : f.refinancingStatus === 'FAILED' ? 25 : 50;
  const riskPenalty = Math.min(6, (f.newRisks || []).length * .5);
  // Most weight remains on the live operating state; long-term health,
  // refinancing and newly created risks prevent short-term cash from
  // masquerading as a complete recovery.
  const score = liquidity * .3 + debtLoad * .2 + continuity * .2 + ebitda * .15 + execution * .15 + (longTermHealth - 50) * .05 + (refinancing - 50) * .03 - riskPenalty;
  // The upper tier leaves room for a high-liquidity, high-control-cost path:
  // strong cash generation can coexist with a separate governance control loss.
  const tier = score >= 63 ? 'STRONG_SURVIVAL' : score >= 43 ? 'FRAGILE_SURVIVAL' : 'FINANCIAL_COLLAPSE';
  return { tier, score: Math.round(score), metrics: { liquidity: Math.round(liquidity), debtLoad: Math.round(debtLoad), continuity: Math.round(continuity), ebitda: Math.round(ebitda), execution: Math.round(execution), longTermHealth: Math.round(longTermHealth), refinancing: Math.round(refinancing), riskPenalty } };
}
function calculateGovernanceOutcome(state) {
  const g = state.governanceState; let score = 45;
  if (hasDossier(state, 'HS-G')) score += 15;
  if (state.priorities.includes('Governance & Family')) score += 25; else score -= 16;
  if (state.reassessment.changedDiagnosis || state.reassessment.changedTreatment) score -= state.reassessment.costApplied;
  if (state.houndstoothState.triggerStatus && !g.houndstoothHandled) score -= 30;
  if (state.houndstoothState.controlLost) return { tier: 'CONTROL_LOST', score: 10 };
  if (score >= 65) return { tier: 'FAMILY_ALIGNED', score: Math.round(score) };
  // Low preparation fractures the family, but it does not by itself prove
  // that control has transferred. CONTROL_LOST is reserved for the explicit
  // Houndstooth exercise/control transition above.
  return { tier: 'FAMILY_FRACTURED', score: Math.round(score) };
}
function calculateCounselorPerformance(state) {
  const ids = distinctEvidenceIds(state.initialDiagnosisEvidenceIds || []); const diagnosis = state.initialDiagnosis; const relations = ids.map((id) => relationshipFor(state, diagnosis, id));
  const support = relations.filter((r) => r === 'SUPPORTS').length; const contradiction = relations.filter((r) => r === 'CONTRADICTS').length;
  const investigation = clamp(35 + state.draftSelection.dossiers.length * 8 + state.draftSelection.questions1.length * 3 + (hasDossier(state, 'HS-D') ? 10 : 0));
  const reasoning = clamp(35 + support * 15 - contradiction * 16 - (ids.length === 0 ? 15 : 0));
  const suitability = clamp(38 + (state.implementedTreatment === state.proposedTreatment ? 12 : 3) + (state.financialState.executionSuccess ? 28 : 4) + (state.timing === 'D' ? -12 : 5));
  const communication = clamp(48 + (state.priorities.includes('Customers') ? 18 : 0) + (state.priorities.includes('Employees') ? 12 : 0));
  const ethics = clamp(48 + (hasDossier(state, 'HS-G') ? 12 : 0) + (state.governanceState.disclosure ? 10 : 0));
  const adaptation = clamp(state.reassessment.applied ? (state.reassessment.costApplied === 0 ? 86 : 52) : 35);
  const overall = investigation * .2 + reasoning * .2 + suitability * .25 + communication * .15 + ethics * .1 + adaptation * .1;
  return { overall: Math.round(overall), dimensions: { investigation: Math.round(investigation), reasoning: Math.round(reasoning), suitability: Math.round(suitability), communication: Math.round(communication), ethics: Math.round(ethics), adaptation: Math.round(adaptation) } };
}
function endingCopy(financial, governance) {
  const matrix = {
    'STRONG_SURVIVAL|FAMILY_ALIGNED': ['Người kế nghiệp', 'Công ty giữ được nền tảng và gia đình miễn cưỡng phối hợp dưới David.'],
    'STRONG_SURVIVAL|FAMILY_FRACTURED': ['Hưu chiến có điều kiện', 'Công ty ổn hơn nhưng David phải chia sẻ quyền lực để giữ hòa khí.'],
    'STRONG_SURVIVAL|CONTROL_LOST': ['Thắng trận, thua nhà', 'Công ty khỏe hơn nhưng quyền kiểm soát rời khỏi David.'],
    'FRAGILE_SURVIVAL|FAMILY_ALIGNED': ['Cầm cự cùng nhau', 'Công ty còn sống với biên an toàn mỏng; gia đình cùng chịu rủi ro.'],
    'FRAGILE_SURVIVAL|FAMILY_FRACTURED': ['Chia phần trước khi chìm', 'Công ty nhỏ hơn và gia đình phải nhượng bộ lẫn nhau.'],
    'FRAGILE_SURVIVAL|CONTROL_LOST': ['Tự ăn thịt mình', 'Công ty còn tồn tại về kỹ thuật nhưng tranh chấp làm tiêu hao giá trị.'],
    'FINANCIAL_COLLAPSE|FAMILY_ALIGNED': ['Chết trong danh dự', 'Công ty thất bại nhưng gia đình vẫn cùng chịu trách nhiệm.'],
    'FINANCIAL_COLLAPSE|FAMILY_FRACTURED': ['Quân cờ của quỹ', 'Chủ nợ hoặc quỹ giành vị thế trong khi gia đình tiếp tục đấu đá.'],
    'FINANCIAL_COLLAPSE|CONTROL_LOST': ['Sụp đổ toàn diện', 'Tòa án và chủ nợ tiếp quản giữa lúc gia đình mất quyền kiểm soát.']
  };
  return matrix[`${financial.tier}|${governance.tier}`] || ['Kết quả chưa xác định', 'State cuối chưa tạo được một ô kết cục hợp lệ.'];
}
function finalize(state) {
  updateHoundstooth(state);
  const financial = calculateFinancialOutcome(state); const governance = calculateGovernanceOutcome(state); state.governanceState.score = governance.score; const process = calculateCounselorPerformance(state); const ending = endingCopy(financial, governance);
  state.finalOutcome = { financial, governance, process, ending: { title: ending[0], text: ending[1] }, reputation: reputationTier(state.reputation), reputationLabel: reputationLabel(state.reputation) };
  const useful = (state.finalDiagnosisEvidenceIds || []).filter((id) => relationshipFor(state, state.finalDiagnosis, id) === 'SUPPORTS');
  const contradictory = (state.finalDiagnosisEvidenceIds || []).filter((id) => relationshipFor(state, state.finalDiagnosis, id) === 'CONTRADICTS');
  const missed = Object.keys(EVIDENCE).filter((id) => ['DISCOVERED', 'VERIFIED'].includes(evidenceStatus(state, id)) === false && EVIDENCE[id].relationships?.[state.finalDiagnosis] === 'SUPPORTS').slice(0, 3);
  state.finalFeedback = { result: ending[0], reason: `Chẩn đoán ${state.initialDiagnosis}; evidence hỗ trợ: ${useful.join(', ') || 'không có'}; evidence mâu thuẫn: ${contradictory.join(', ') || 'không có'}.`, meaning: `Phác đồ đề nghị ${state.proposedTreatment} được thực thi ở Period 1 dưới dạng ${state.implementedTreatment}; tái khám ${state.reassessment.mode || 'KEEP'}. Reputation cuối ở tier ${reputationLabel(state.reputation)} chỉ giải thích phản ứng stakeholder, không đổi ô ma trận.`, action: `Financial Outcome: ${financial.tier}; Governance & Family Outcome: ${governance.tier}.`, limit: missed.length ? `Evidence quan trọng chưa mở: ${missed.join(', ')}.` : 'Không còn evidence hỗ trợ trực tiếp nào bị bỏ sót trong kho đã định nghĩa.' };
}

function selectionCount(state, screen) {
  const d = state.draftSelection;
  if (screen === 2) return d.dossiers.length; if (screen === 3) return d.questions1.length; if (screen === 9) return d.priorities.length; if (screen === 6) return d.diagnosisEvidenceIds.length; if (screen === 11) return d.reassessmentEvidenceIds.length; return 0;
}
function optionCard(item, selected, attrs = '') {
  return `<button type="button" class="option-card ${selected ? 'selected' : ''}" ${attrs}><span class="option-top"><span class="option-id">${escapeHtml(item.id)}</span><span class="option-check" aria-hidden="true">✓</span></span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc || '')}</p></button>`;
}
function renderStepper(state) {
  return `<div class="stepper-card">${SCREEN_LABELS.map((label, i) => `<div class="step ${i === state.currentScreen ? 'current' : i < state.currentScreen ? 'done' : ''}"><span>${i}</span><b>${escapeHtml(label)}</b></div>`).join('')}</div>`;
}
function renderNotebook(state) {
  const opened = Object.keys(state.evidenceLedger).filter((id) => ['CLUE', 'DISCOVERED', 'VERIFIED', 'DISPROVED'].includes(evidenceStatus(state, id)));
  const dossierList = (state.selectedDossiers || []).map((id) => { const d = DOSSIERS[id]; return `<button class="notebook-item dossier-notebook-item" type="button" data-dossier-open="${escapeHtml(id)}"><span class="notebook-dot"></span><span><strong>${escapeHtml(d.id)} · ${escapeHtml(d.title)}</strong><small>Mở hồ sơ để xem nội dung đầy đủ</small></span></button>`; }).join('');
  return `<section class="state-card notebook-card"><div class="card-label-row"><span class="card-label">EVIDENCE NOTEBOOK</span><span class="notebook-count">${opened.length} đã mở</span></div>${dossierList ? `<div class="notebook-list dossier-list">${dossierList}</div>` : ''}${opened.length ? `<div class="notebook-list">${opened.map((id) => { const e = currentEvidence(state, id); return `<button class="notebook-item" type="button" data-evidence-open="${escapeHtml(id)}"><span class="notebook-dot"></span><span><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.source)} · ${escapeHtml(statusLabel(e.status))}</small></span></button>`; }).join('')}</div>` : '<p class="ledger-empty">Chưa có hồ sơ được mở.</p>'}</section>`;
}
function renderSidebar(state) {
  const f = state.financialState; const showFinance = state.currentScreen >= 4;
  return `<aside class="side-column"><section class="state-card client-card"><div class="card-label">CURRENT CLIENT</div><div class="client-mini"><div class="client-avatar">D</div><div><strong>David Anderson</strong><span>CEO · Toy Kingdom Inc.</span></div></div><p class="side-copy">${state.currentScreen < 2 ? 'Hồ sơ tiếp nhận đang chờ mở.' : 'Các dữ kiện đã mở được lưu trong sổ evidence.'}</p></section>${showFinance ? `<section class="state-card financial-card"><div class="card-label">KNOWN FIGURES</div><div class="known-figure"><span>Cash FY2026</span><strong>$${money(f.cash)}m</strong></div><div class="known-figure"><span>Debt snapshot</span><strong>$${money(f.debt)}m</strong></div><div class="known-figure"><span>Measured EBITDA</span><strong>$${money(f.ebitda, 1)}m</strong></div></section>` : ''}${renderNotebook(state)}${state.eventLedger.length ? `<section class="state-card ledger-card"><div class="card-label-row"><span class="card-label">TIMELINE</span><span class="notebook-count">${state.eventLedger.length} diễn biến</span></div><div class="event-list">${state.eventLedger.slice(-3).map((e) => `<div class="ledger-item"><i></i><span><strong>${escapeHtml(e.title)}</strong><br />${escapeHtml(e.text)}</span></div>`).join('')}</div></section>` : ''}</aside>`;
}

function renderDossierScreen(state) {
  const selected = state.draftSelection.dossiers; return `<div class="options-wrap"><div class="select-helper"><span>Chọn đúng 3 hồ sơ để mở</span><b>${selected.length}/3</b></div><div class="option-grid dossier-grid">${Object.values(DOSSIERS).map((d) => optionCard({ id: d.id, title: d.title, desc: `${d.scope}. ${d.summary}` }, selected.includes(d.id), `data-select-kind="dossier" data-select-id="${d.id}"`)).join('')}</div></div>`;
}
function renderQuestionScreen(state) {
  const selected = state.draftSelection.questions1; return `<div class="options-wrap"><div class="select-helper"><span>Chọn đúng 2 câu hỏi</span><b>${selected.length}/2</b></div><div class="option-grid">${QUESTIONS_1.map((q) => optionCard({ id: q.id, title: q.title, desc: 'Câu hỏi bổ sung cho một lát cắt của hồ sơ.' }, selected.includes(q.id), `data-select-kind="question1" data-select-id="${q.id}"`)).join('')}</div></div>`;
}
function renderFinancials() {
  const answers = state.answeredQuestions?.filter((q) => q.id.startsWith('CH1-')) || [];
  const answerBlock = answers.length ? `<section class="answer-block"><span class="card-label">CÂU TRẢ LỜI ĐÃ NHẬN</span>${answers.map((q) => `<div><strong>${escapeHtml(q.id)}</strong><p>${escapeHtml(q.answer)}</p></div>`).join('')}</section>` : '';
  const governanceNote = hasDossier(state, 'HS-G') ? '<section class="answer-block governance-note"><span class="card-label">ANNOTATION ĐƯỢC CẤP QUYỀN</span><p>Khoản Other Income, net $149m phần lớn đến từ tiền bảo hiểm nhân thọ đang nằm trong tài khoản tranh chấp. David muốn tái đầu tư; Michael và Richard muốn chia ngay.</p></section>' : '';
  return `<div class="table-wrap"><table><caption>Consolidated Income Statement · triệu USD</caption><thead><tr><th>Chỉ tiêu</th><th>FY2024</th><th>FY2025</th><th>FY2026</th></tr></thead><tbody><tr><th>Net Sales</th><td>12,361</td><td>11,802</td><td>11,540</td></tr><tr><th>Cost of Sales</th><td>(7,931)</td><td>(7,576)</td><td>(7,432)</td></tr><tr><th>Gross Margin</th><td>4,430</td><td>4,226</td><td>4,108</td></tr><tr><th>SG&A</th><td>(3,915)</td><td>(3,593)</td><td>(3,480)</td></tr><tr><th>Depreciation &amp; Amortization</th><td>(377)</td><td>(343)</td><td>(317)</td></tr><tr><th>Other Income, net</th><td>53</td><td>88</td><td>149</td></tr><tr><th>Operating Earnings</th><td>191</td><td>378</td><td>460</td></tr><tr><th>Interest Expense</th><td>(451)</td><td>(429)</td><td>(457)</td></tr><tr><th>Interest Income</th><td>4</td><td>3</td><td>2</td></tr><tr><th>Earnings / (Loss) Before Tax</th><td>(256)</td><td>(48)</td><td>5</td></tr><tr><th>Income Tax Expense</th><td>(32)</td><td>(76)</td><td>(34)</td></tr><tr><th>Net Loss</th><td>(288)</td><td>(124)</td><td>(29)</td></tr><tr><th>Noncontrolling Interest</th><td>(4)</td><td>(6)</td><td>(7)</td></tr><tr><th>Net Loss attributable</th><td>(292)</td><td>(130)</td><td>(36)</td></tr></tbody></table><table><caption>Operating Metrics</caption><thead><tr><th>Chỉ tiêu</th><th>FY2024</th><th>FY2025</th><th>FY2026</th></tr></thead><tbody><tr><th>Gross Margin %</th><td>35.8%</td><td>35.8%</td><td>35.6%</td></tr><tr><th>SG&A / Sales</th><td>31.7%</td><td>30.4%</td><td>30.2%</td></tr><tr><th>Adjusted EBITDA</th><td>$642m</td><td>$800m</td><td>$792m</td></tr><tr><th>Consolidated SSS</th><td>0.0%</td><td>+0.9%</td><td>−1.4%</td></tr></tbody></table><div class="facts-grid"><div><span>Cash</span><strong>$566m</strong></div><div><span>Receivables</span><strong>$255m</strong></div><div><span>Inventory</span><strong>$2.476bn</strong></div><div><span>Current assets</span><strong>$3.389bn</strong></div><div><span>Property &amp; equipment</span><strong>$3.067bn</strong></div><div><span>Total debt</span><strong>~$4.8bn</strong></div><div><span>Secured debt</span><strong>~$3.4bn</strong></div><div><span>Stockholders’ deficit</span><strong>~$1.3bn</strong></div></div>${answerBlock}${governanceNote}</div>`;
}
function renderQuestion2(state) {
  const selected = state.draftSelection.question2; return `<div class="options-wrap"><div class="select-helper"><span>Chọn một câu hỏi</span><b>${selected ? '1/1' : '0/1'}</b></div><div class="option-grid">${QUESTIONS_2.map((q) => optionCard({ id: q.id, title: q.title, desc: 'Một câu hỏi để kiểm tra giả thuyết trước khi chốt kế hoạch.' }, selected === q.id, `data-select-kind="question2" data-select-id="${q.id}"`)).join('')}</div></div>`;
}
function renderDiagnosis(state, reassessment = false) {
  const selectedDiagnosis = reassessment ? state.draftSelection.reassessmentDiagnosis : state.draftSelection.diagnosis;
  const selectedEvidence = reassessment ? state.draftSelection.reassessmentEvidenceIds : state.draftSelection.diagnosisEvidenceIds;
  const eligible = citableEvidence(state); const diagnosisCards = DIAGNOSES.map((d) => optionCard(d, selectedDiagnosis === d.id, `data-select-kind="${reassessment ? 'reassess-diagnosis' : 'diagnosis'}" data-select-id="${d.id}"`)).join('');
  const evidence = eligible.length ? eligible.map((id) => { const e = currentEvidence(state, id); return `<div class="evidence-row ${selectedEvidence.includes(id) ? 'selected' : ''}"><button type="button" class="evidence-name" data-evidence-open="${escapeHtml(id)}"><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.source)} · ${escapeHtml(statusLabel(e.status))}</small></button><button type="button" class="evidence-use" data-evidence-toggle="${escapeHtml(id)}" aria-pressed="${selectedEvidence.includes(id)}">${selectedEvidence.includes(id) ? 'Đã chọn' : 'Dùng làm bằng chứng'}</button></div>`; }).join('') : '<p class="empty-evidence">Chưa có evidence đủ trạng thái để viện dẫn. Bạn vẫn có thể tiếp tục với chẩn đoán chưa có bằng chứng hỗ trợ.</p>';
  return `<div class="option-grid diagnosis-grid">${diagnosisCards}</div><section class="evidence-picker"><div class="picker-head"><div><span class="card-label">SUPPORTING EVIDENCE</span><h3>Chọn dữ kiện để bảo vệ lập luận</h3></div><b>${selectedEvidence.length}/3</b></div><p class="picker-note">Bấm tên để đọc chi tiết. Đọc evidence không tự động chọn nó.</p><div class="evidence-options">${evidence}</div></section>`;
}
function renderTreatment(state, reassessment = false) {
  const selected = reassessment ? state.draftSelection.reassessmentTreatment : state.draftSelection.treatment; return `<div class="option-grid">${TREATMENTS.map((t) => optionCard(t, selected === t.id, `data-select-kind="${reassessment ? 'reassess-treatment' : 'treatment'}" data-select-id="${t.id}"`)).join('')}</div>`;
}
function renderScreen(state) {
  const s = state.currentScreen; if (s === 0) return `<section class="intake-card"><div class="eyebrow"><span class="eyebrow-line"></span> CONFIDENTIAL · CLIENT FILE</div><h1>Toy Kingdom Inc.<br /><em>Gia tộc Anderson</em></h1><p class="hero-lead">Một công ty bán lẻ đang cải thiện vận hành nhưng thiếu vốn tái đầu tư và đồng thuận gia đình.</p><div class="intake-facts"><div><span>Ngành</span><strong>Specialty retail · đồ chơi</strong></div><div><span>Doanh thu FY2026</span><strong>$11.540bn</strong></div><div><span>Quy mô</span><strong>~1.700 cửa hàng</strong></div><div><span>Sở hữu</span><strong>Anderson 78% · Fund 22%</strong></div><div><span>Adjusted EBITDA</span><strong>$792m</strong></div><div><span>Operating Earnings</span><strong>$460m</strong></div><div><span>Net Loss attributable</span><strong>−$36m</strong></div><div><span>Giao dịch lớn</span><strong>LBO mô phỏng $6.6bn · 2015</strong></div></div></section>`;
  if (s === 1) return `<section class="dialogue-card"><div class="eyebrow"><span class="eyebrow-line"></span> DAVID ANDERSON · CEO</div><blockquote>“Sales tiếp tục giảm. Amazon, Walmart và online retail đang thay đổi cả ngành. Một số chỉ số tốt lên nhưng công ty vẫn ngày càng khó xoay xở.”</blockquote><blockquote>“Tôi phát hiện Michael đang thuê luật sư riêng, và Richard âm thầm chào bán tài sản quốc tế mà không qua hội đồng. Tôi không biết đây là bệnh của thị trường, hay bệnh trong chính gia đình tôi.”</blockquote></section>`;
  if (s === 2) return renderDossierScreen(state);
  if (s === 3) return renderQuestionScreen(state);
  if (s === 4) return `<div class="statement-wrap">${renderFinancials()}</div>`;
  if (s === 5) return renderQuestion2(state);
  if (s === 6) { const answer = state.answeredQuestions?.find((q) => q.id === state.selectedQuestion2); return `<div class="options-wrap diagnosis-wrap">${answer ? `<section class="answer-block compact"><span class="card-label">CÂU TRẢ LỜI ĐÃ NHẬN</span><p>${escapeHtml(answer.id)} · ${escapeHtml(answer.answer)}</p></section>` : ''}${renderDiagnosis(state)}</div>`; }
  if (s === 7) return `<div class="options-wrap"><div class="select-helper"><span>Chọn một phác đồ</span><b>${state.draftSelection.treatment ? '1/1' : '0/1'}</b></div>${renderTreatment(state)}</div>`;
  if (s === 8) return `<div class="options-wrap"><div class="select-helper"><span>Chọn một thời điểm</span><b>${state.draftSelection.timing ? '1/1' : '0/1'}</b></div><div class="option-grid">${TIMINGS.map((t) => optionCard(t, state.draftSelection.timing === t.id, `data-select-kind="timing" data-select-id="${t.id}"`)).join('')}</div></div>`;
  if (s === 9) return `<div class="options-wrap"><div class="select-helper"><span>Chọn đúng 3 nhóm ưu tiên</span><b>${state.draftSelection.priorities.length}/3</b></div><div class="option-grid">${PRIORITIES.map((p) => optionCard(p, state.draftSelection.priorities.includes(p.id), `data-select-kind="priority" data-select-id="${p.id}"`)).join('')}</div></div>`;
  if (s === 10) { const event = state.eventSequence[state.eventCursor] || { title: 'Đang chuẩn bị diễn biến', text: '' }; return `<div class="timeline-wrap"><div class="timeline-tabs">${state.eventSequence.map((e, i) => `<span class="timeline-tab ${i === state.eventCursor ? 'current' : i < state.eventCursor ? 'done' : ''}">${i + 1}. ${escapeHtml(e.title)}</span>`).join('')}</div><article class="event-card"><span class="card-label">DIỄN BIẾN · PERIOD 1</span><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.text)}</p></article></div>`; }
  if (s === 11) { const mode = state.draftSelection.reassessmentMode; return `<div class="options-wrap reassessment-wrap"><div class="option-grid">${REASSESS_MODES.map((m) => optionCard(m, mode === m.id, `data-select-kind="reassess-mode" data-select-id="${m.id}"`)).join('')}</div>${mode && ['DIAGNOSIS', 'BOTH'].includes(mode) ? `<section class="reassess-section"><span class="card-label">DIAGNOSIS KỲ TIẾP THEO</span>${renderDiagnosis(state, true)}</section>` : ''}${mode && ['TREATMENT', 'BOTH'].includes(mode) ? `<section class="reassess-section"><span class="card-label">TREATMENT KỲ TIẾP THEO</span>${renderTreatment(state, true)}</section>` : ''}</div>`; }
  return renderResult(state);
}
function renderGame(state) {
  const title = state.currentScreen === 0 ? 'Hồ sơ tiếp nhận' : `Case 01 · ${SCREEN_LABELS[state.currentScreen]}`;
  const prompts = { 0: 'Toy Kingdom Inc. · Gia tộc Anderson', 1: 'Lắng nghe trước khi đặt câu hỏi', 2: 'Chọn hồ sơ cần mở', 3: 'Thu hẹp khoảng trống thông tin', 4: 'Báo cáo tài chính đầy đủ', 5: 'Một câu hỏi trước khi chẩn đoán', 6: 'Liên kết dữ kiện với giả thuyết', 7: 'Bàn điều trị', 8: 'Chọn thời điểm hành động', 9: 'Chuẩn bị trước khi công bố', 10: 'Theo dõi diễn biến', 11: 'Dữ kiện mới sau Period 1', 12: 'Tổng kết buổi tư vấn' };
  const terminal = state.status === 'COMPLETED' && state.currentScreen === 12;
  const effectiveScreen = terminal ? 12 : Math.min(Math.max(state.currentScreen, 0), 11);
  const effectiveTitle = effectiveScreen === 0 ? 'Hồ sơ tiếp nhận' : `Case 01 · ${SCREEN_LABELS[effectiveScreen]}`;
  return `<section class="hero section-wrap game-hero"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-line"></span> ${escapeHtml(effectiveTitle)}</div><h1>${escapeHtml(prompts[effectiveScreen])}</h1><p class="hero-lead">${terminal ? 'Kết quả được giải thích từ evidence, quyết định, diễn biến và outcome.' : 'Mỗi lựa chọn đã xác nhận sẽ trở thành một phần của hồ sơ vụ việc.'}</p></div><div class="hero-meta"><div class="client-mini"><div class="client-avatar">D</div><div><strong>David Anderson</strong><span>CEO · Toy Kingdom Inc.</span></div></div>${!terminal ? '<button class="text-btn" type="button" id="restartBtn">↻ Chơi lại</button>' : ''}</div></section><section class="section-wrap workspace"><div class="main-column">${effectiveScreen > 0 && effectiveScreen < 12 ? renderStepper({ ...state, currentScreen: effectiveScreen }) : ''}<section class="decision-card" aria-live="polite">${terminal ? renderResult(state) : renderDecisionFrame({ ...state, currentScreen: effectiveScreen })}</section></div>${effectiveScreen < 12 ? renderSidebar({ ...state, currentScreen: effectiveScreen }) : ''}</section>`;
}
function renderDecisionFrame(state) {
  const s = state.currentScreen; const validation = validateScreen(state); const canConfirm = s === 0 || s === 1 || s === 4 || s === 10 || !validation; const labels = { 0: 'Bắt đầu khám', 1: 'Bắt đầu chẩn đoán', 2: 'Mở hồ sơ đã chọn', 3: 'Ghi nhận câu hỏi', 4: 'Tiếp tục', 5: 'Ghi nhận câu hỏi', 6: 'Chốt chẩn đoán', 7: 'Ghi nhận phác đồ', 8: 'Ghi nhận thời điểm', 9: 'Bắt đầu diễn biến', 10: state.eventCursor >= state.eventSequence.length - 1 ? 'Tiếp tục tái khám' : 'Đọc diễn biến tiếp theo', 11: 'Chốt tái khám' };
  const context = s === 10 ? '' : s === 0 || s === 1 || s === 4 ? '' : `<p class="frame-note">${escapeHtml(validation || 'Sau khi xác nhận, lựa chọn này sẽ được khóa trong hồ sơ.')}</p>`;
  return `<div class="fade-in"><div class="decision-head"><div class="decision-kicker"><span class="decision-number">Màn ${String(s).padStart(2, '0')} · ${escapeHtml(SCREEN_LABELS[s])}</span>${s >= 2 && s <= 9 ? `<span class="count-chip">${selectionCount(state, s)} đã chọn</span>` : ''}</div><h2>${escapeHtml(screenTitle(s))}</h2><p>${escapeHtml(screenPrompt(s))}</p></div>${renderScreen(state)}${context}<div class="confirm-bar"><div class="confirm-copy"><strong>${validation && ![0, 1, 4, 10].includes(s) ? 'Chưa thể xác nhận' : 'Sẵn sàng'}</strong><span>${s === 10 ? 'Diễn biến là dữ kiện của timeline mô phỏng.' : 'Xác nhận để chuyển sang màn tiếp theo.'}</span></div><button type="button" class="primary-btn" id="confirmBtn" ${canConfirm ? '' : 'disabled'}>${escapeHtml(labels[s])} →</button></div></div>`;
}
function screenTitle(screen) { return ({ 0: 'Hồ sơ tiếp nhận', 1: 'Phòng khám', 2: 'Bảng sinh hiệu', 3: 'Câu hỏi bổ sung', 4: 'Báo cáo tài chính đầy đủ', 5: 'Câu hỏi cuối', 6: 'Chẩn đoán', 7: 'Bàn điều trị', 8: 'Thời điểm', 9: 'Chuẩn bị', 10: 'Diễn biến', 11: 'Tái khám' })[screen] || 'Kết thúc'; }
function screenPrompt(screen) { return ({ 0: 'Đây là hồ sơ mật của khách hàng. Đọc các dữ kiện nền trước khi bắt đầu.', 1: 'David mô tả một áp lực vận hành và một bất đồng trong gia đình.', 2: 'Bạn có ba lượt mở hồ sơ trong giai đoạn này. Bốn hồ sơ không chọn sẽ giữ trạng thái khóa.', 3: 'Hai câu hỏi có thể mở thêm các manh mối bề mặt trước khi xem BCTC.', 4: 'CFO cung cấp báo cáo đầy đủ. Các số liệu công khai ở đây là một nguồn độc lập.', 5: 'Câu hỏi cuối giúp kiểm tra giả thuyết bạn đang chuẩn bị đưa vào chẩn đoán.', 6: 'Chọn giả thuyết của bạn và tự viện dẫn dữ kiện đã thu thập.', 7: 'Chọn một phác đồ để đưa vào bước phê duyệt.', 8: 'Thời điểm sẽ trở thành một phần của timeline mô phỏng.', 9: 'Chọn ba nhóm cần được chuẩn bị trước khi công bố kế hoạch.', 10: 'Các cập nhật xuất hiện tuần tự theo timeline; chúng là dữ kiện để tái khám.', 11: 'Dữ kiện Period 1 đã được lưu. Quyết định mới chỉ áp dụng cho kỳ tiếp theo.' })[screen] || ''; }

function renderResult(state) {
  const outcome = state.finalOutcome || (finalize(state), state.finalOutcome); const p = outcome.process; const f = outcome.financial; const g = outcome.governance; const feedback = state.finalFeedback;
  const tierNames = { STRONG_SURVIVAL: 'Sống sót vững', FRAGILE_SURVIVAL: 'Sống sót mong manh', FINANCIAL_COLLAPSE: 'Sụp đổ tài chính', FAMILY_ALIGNED: 'Gia tộc đoàn kết', FAMILY_FRACTURED: 'Gia tộc chia rẽ, chưa vỡ', CONTROL_LOST: 'Mất kiểm soát' };
  const dims = [['Investigation', p.dimensions.investigation], ['Reasoning & Diagnosis', p.dimensions.reasoning], ['Solution Suitability', p.dimensions.suitability], ['Communication', p.dimensions.communication], ['Professionalism & Ethics', p.dimensions.ethics], ['Monitoring & Adaptation', p.dimensions.adaptation]];
  const downgrade = state.proposedTreatment !== state.implementedTreatment ? `Approval downgrade: ${state.proposedTreatment} → ${state.implementedTreatment}.` : 'Treatment được phê duyệt theo đề nghị.';
  const events = state.eventLedger.map((e) => e.title).join(', ') || 'Chưa có';
  const reassessEvidence = state.reassessment.evidenceIds?.join(', ') || 'Không có';
  return `<div class="result-card fade-in"><div class="result-hero"><div><div class="eyebrow"><span class="eyebrow-line"></span> CASE COMPLETE</div><h2>${escapeHtml(outcome.ending.title)}</h2><p>${escapeHtml(outcome.ending.text)}</p></div><div class="result-score"><b>${p.overall}</b><span>COUNSELOR PROCESS</span></div></div><section class="result-section"><div class="result-section-head"><h3>Counselor Performance</h3><span>Process score · ${p.overall}/100</span></div><div class="competency-grid">${dims.map(([label, value]) => `<div class="competency"><span>${escapeHtml(label)}</span><strong>${value}</strong><i style="width:${value}%"></i></div>`).join('')}</div></section><section class="result-section outcome-section"><div class="outcome-grid"><div><span class="pillar-label">FINANCIAL OUTCOME</span><strong>${escapeHtml(tierNames[f.tier])}</strong><p>State score ${f.score}; liquidity ${f.metrics.liquidity}, debt load ${f.metrics.debtLoad}, continuity ${f.metrics.continuity}.</p></div><div><span class="pillar-label">GOVERNANCE & FAMILY</span><strong>${escapeHtml(tierNames[g.tier])}</strong><p>State score ${g.score}; quyền kiểm soát được tách khỏi kết quả tài chính.</p></div><div><span class="pillar-label">CONTEXT · UY TÍN</span><strong>${escapeHtml(outcome.reputationLabel)}</strong><p>Phản ứng hội đồng và báo chí được diễn giải theo tier này.</p></div></div></section><section class="result-section history-section"><h3>Decision history</h3><p>Hồ sơ: ${escapeHtml((state.selectedDossiers || []).join(', ') || 'Không có')}. Câu hỏi: ${escapeHtml((state.selectedQuestions1 || []).join(', '))}${state.selectedQuestion2 ? ` · ${escapeHtml(state.selectedQuestion2)}` : ''}. Diagnosis: ${escapeHtml(state.initialDiagnosis || '')} → ${escapeHtml(state.finalDiagnosis || state.initialDiagnosis || '')}. Evidence: ${escapeHtml((state.finalDiagnosisEvidenceIds || []).join(', ') || 'Không có')}.</p><p>Treatment Period 1: ${escapeHtml(state.proposedTreatment || '')} → ${escapeHtml(state.implementedTreatment || '')}. ${escapeHtml(downgrade)} Treatment kỳ tiếp theo: ${escapeHtml(state.finalProposedTreatment || state.proposedTreatment || '')} → ${escapeHtml(state.finalImplementedTreatment || state.implementedTreatment || '')}. Thời điểm: ${escapeHtml(state.timing || '')}. Ưu tiên: ${escapeHtml(state.priorities.join(', '))}.</p><p>Events: ${escapeHtml(events)}. Invalidated assumptions: ${escapeHtml(state.invalidatedAssumptions.join(', ') || 'Không có')}. Reassessment evidence: ${escapeHtml(reassessEvidence)}.</p><p>Houndstooth: trigger ${state.houndstoothState.triggerStatus ? 'có' : 'không'} · exercise ${state.houndstoothState.exercisedStatus ? 'có' : 'không'} · control loss ${state.houndstoothState.controlLost ? 'có' : 'không'}.</p></section><section class="final-feedback"><div class="eyebrow"><span class="eyebrow-line"></span> FINAL FEEDBACK</div><div class="feedback-grid"><div><span>Result</span><p>${escapeHtml(feedback.result)}</p></div><div><span>Reason</span><p>${escapeHtml(feedback.reason)}</p></div><div><span>Meaning</span><p>${escapeHtml(feedback.meaning)}</p></div><div><span>Action</span><p>${escapeHtml(feedback.action)}</p></div><div><span>Limit</span><p>${escapeHtml(feedback.limit)}</p></div></div></section><div class="result-actions"><button type="button" class="secondary-btn" id="closeCaseBtn">Đóng case về menu</button><button type="button" class="primary-btn" id="reopenCaseBtn">Reopen Case 01</button></div></div>`;
}

function renderMenu() {
  const saved = hasSave(); return `<section class="menu-hero section-wrap"><div class="eyebrow"><span class="eyebrow-line"></span> MEDIFIN · FINANCIAL CLINIC</div><h1>Chọn một<br /><em>hồ sơ để khám</em></h1><p class="hero-lead">Mỗi case là một mô phỏng độc lập. Tiến trình được lưu riêng theo hồ sơ.</p></section><section class="section-wrap case-menu"><article class="case-menu-card playable" data-case-id="case01"><div class="case-menu-top"><span class="case-number">CASE 01</span><span class="status-pill">PLAYABLE</span></div><h2>Toy Kingdom Inc.</h2><p>Gia tộc Anderson · specialty retail · 13 màn hình điều tra, chẩn đoán và tái khám.</p><div class="case-facts"><span>~1.700 cửa hàng</span><span>FY2026 $11.540bn</span><span>Anderson 78%</span></div><div class="case-actions"><button class="primary-btn" type="button" data-menu-action="start">${saved ? 'Tiếp tục' : 'Bắt đầu case'} →</button>${saved ? '<button class="secondary-btn" type="button" data-menu-action="restart">Chơi lại</button>' : ''}</div></article><article class="case-menu-card incoming" data-case-id="case02" aria-disabled="true"><div class="case-menu-top"><span class="case-number">CASE 02</span><span class="status-pill muted">INCOMING</span></div><h2>Đang chuẩn bị</h2><p>Hồ sơ tiếp theo sẽ được phát hành trong phiên bản sau.</p><div class="case-facts"><span>Chưa mở</span><span>Không khả dụng</span></div><button class="secondary-btn" type="button" disabled>Incoming</button></article></section>`;
}

let state = makeInitialState(); let view = 'menu'; let busy = false; let modalEvidenceId = null; let modalDossierId = null; let modalReturnFocus = null;
function render() {
  const main = document.getElementById('mainContent'); const top = document.getElementById('topbarContext'); const footer = document.getElementById('footerContext'); const menuBtn = document.getElementById('menuBtn');
  if (view === 'menu') { main.innerHTML = renderMenu(); top.innerHTML = ''; footer.textContent = 'Case selection'; menuBtn.classList.add('hidden'); }
  else { main.innerHTML = renderGame(state); top.innerHTML = `<span class="topbar-dot"></span><span>FINANCIAL CLINIC</span><span class="topbar-slash">/</span><span>CASE 01</span>`; footer.textContent = `Case 01 / ${SCREEN_LABELS[state.currentScreen] || 'Complete'}`; menuBtn.classList.remove('hidden'); }
  bindDynamicState();
}
function bindDynamicState() { const modal = document.getElementById('evidenceModal'); if (modalEvidenceId) modal.classList.remove('hidden'); }
function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.__medifinToast); window.__medifinToast = window.setTimeout(() => el.classList.remove('show'), 2400); }
function startCase(restart = false) { if (restart) clearCaseSave(); state = restart ? makeInitialState() : loadState(); view = 'game'; saveState(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function goMenu() { view = 'menu'; closeModal(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function confirmCurrent() {
  if (busy || state.status === 'COMPLETED' || state.currentScreen >= 12) return;
  const error = validateScreen(state); const easy = [0, 1, 4, 10].includes(state.currentScreen); if (error && !easy) { toast(error); return; }
  busy = true; const screenBefore = state.currentScreen; applyScreen(state);
  if (state.status !== 'COMPLETED' && screenBefore !== 10 && screenBefore !== 11) state.currentScreen = screenBefore + 1;
  if (screenBefore === 11) state.status = 'COMPLETED';
  if (screenBefore !== 10 || state.currentScreen !== 10) { if (!state.confirmedScreens.includes(screenBefore)) state.confirmedScreens.push(screenBefore); state.decisionHistory.push({ screen: screenBefore, selection: deepCopy(state.draftSelection), at: Date.now() }); state.transitionIds.push(`${screenBefore}-${state.confirmedScreens.length}`); }
  saveState(); render(); busy = false; window.setTimeout(() => document.querySelector('.decision-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
}
function setSelection(kind, id) {
  const d = state.draftSelection;
  if (kind === 'dossier') { const list = d.dossiers; if (list.includes(id)) list.splice(list.indexOf(id), 1); else if (list.length < 3) list.push(id); else toast('Chỉ được chọn 3 hồ sơ.'); }
  if (kind === 'question1') { const list = d.questions1; if (list.includes(id)) list.splice(list.indexOf(id), 1); else if (list.length < 2) list.push(id); else toast('Chỉ được chọn 2 câu hỏi.'); }
  if (kind === 'question2') d.question2 = id;
  if (kind === 'diagnosis') d.diagnosis = id;
  if (kind === 'treatment') d.treatment = id;
  if (kind === 'timing') d.timing = id;
  if (kind === 'priority') { const list = d.priorities; if (list.includes(id)) list.splice(list.indexOf(id), 1); else if (list.length < 3) list.push(id); else toast('Chỉ được chọn 3 nhóm ưu tiên.'); }
  if (kind === 'reassess-mode') { d.reassessmentMode = id; d.reassessmentDiagnosis = null; d.reassessmentTreatment = null; d.reassessmentEvidenceIds = []; }
  if (kind === 'reassess-diagnosis') d.reassessmentDiagnosis = id;
  if (kind === 'reassess-treatment') d.reassessmentTreatment = id;
  render();
}
function selectedEvidenceList() { return state.currentScreen === 11 ? state.draftSelection.reassessmentEvidenceIds : state.draftSelection.diagnosisEvidenceIds; }
function toggleEvidence(id) { const list = selectedEvidenceList(); if (!citableEvidence(state).includes(id)) return toast('Evidence này chưa đủ trạng thái để viện dẫn.'); if (list.includes(id)) list.splice(list.indexOf(id), 1); else if (list.length < 3) list.push(id); else return toast('Có thể dùng tối đa 3 evidence.'); closeModal(); render(); }
function openEvidence(id, target) { if (!EVIDENCE[id] || !['CLUE', 'DISCOVERED', 'VERIFIED', 'DISPROVED'].includes(evidenceStatus(state, id))) return; modalEvidenceId = id; modalDossierId = null; modalReturnFocus = target || document.activeElement; const e = currentEvidence(state, id); document.getElementById('modalTitle').textContent = `${e.id} · ${e.title}`; document.getElementById('modalBody').innerHTML = `<div class="modal-meta"><span>${escapeHtml(e.source)}</span><span>${escapeHtml(statusLabel(e.status))}</span></div><p class="modal-text">${escapeHtml(e.text)}</p>${e.provenance?.length ? `<p class="modal-provenance">Được mở từ: ${escapeHtml(e.provenance.join(', '))}</p>` : ''}`; const selected = selectedEvidenceList().includes(id); document.getElementById('modalActions').innerHTML = citableEvidence(state).includes(id) && [6, 11].includes(state.currentScreen) ? `<button type="button" class="secondary-btn" id="modalEvidenceAction">${selected ? 'Bỏ chọn' : 'Dùng làm bằng chứng'}</button>` : ''; document.getElementById('evidenceModal').classList.remove('hidden'); window.setTimeout(() => document.getElementById('modalClose')?.focus(), 0); }
function openDossier(id, target) { if (!hasDossier(state, id) || !DOSSIERS[id]) return; modalDossierId = id; modalEvidenceId = null; modalReturnFocus = target || document.activeElement; const d = DOSSIERS[id]; document.getElementById('modalTitle').textContent = `${d.id} · ${d.title}`; document.getElementById('modalBody').innerHTML = `<div class="modal-meta"><span>${escapeHtml(d.scope)}</span><span>Hồ sơ đã mở</span></div><div class="modal-text">${d.content.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>`; document.getElementById('modalActions').innerHTML = ''; document.getElementById('evidenceModal').classList.remove('hidden'); window.setTimeout(() => document.getElementById('modalClose')?.focus(), 0); }
function closeModal() { const modal = document.getElementById('evidenceModal'); modal.classList.add('hidden'); modalEvidenceId = null; modalDossierId = null; if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') window.setTimeout(() => modalReturnFocus.focus(), 0); modalReturnFocus = null; }

document.addEventListener('click', (event) => {
  const menuAction = event.target.closest('[data-menu-action]'); if (menuAction) { const action = menuAction.dataset.menuAction; if (action === 'start') startCase(false); if (action === 'restart') startCase(true); return; }
  if (event.target.closest('#brandHome')) { event.preventDefault(); goMenu(); return; }
  if (event.target.closest('#menuBtn')) { goMenu(); return; }
  if (event.target.closest('#restartBtn')) { startCase(true); return; }
  if (event.target.closest('#confirmBtn')) { confirmCurrent(); return; }
  const select = event.target.closest('[data-select-kind]'); if (select) { setSelection(select.dataset.selectKind, select.dataset.selectId); return; }
  const evidenceToggle = event.target.closest('[data-evidence-toggle]'); if (evidenceToggle) { toggleEvidence(evidenceToggle.dataset.evidenceToggle); return; }
  const evidenceOpen = event.target.closest('[data-evidence-open]'); if (evidenceOpen) { openEvidence(evidenceOpen.dataset.evidenceOpen, evidenceOpen); return; }
  const dossierOpen = event.target.closest('[data-dossier-open]'); if (dossierOpen) { openDossier(dossierOpen.dataset.dossierOpen, dossierOpen); return; }
  if (event.target.closest('#modalClose') || event.target.id === 'evidenceModal') { closeModal(); return; }
  if (event.target.closest('#modalEvidenceAction')) { toggleEvidence(modalEvidenceId); return; }
  if (event.target.closest('#closeCaseBtn')) { goMenu(); return; }
  if (event.target.closest('#reopenCaseBtn')) { startCase(true); return; }
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modalEvidenceId) closeModal(); });

// A small read-only integration surface keeps the transition engine testable
// without adding a debug control to the production player flow.
window.MEDIFIN = Object.freeze({
  CASE_ID: CANONICAL_CASE_ID,
  makeInitialState,
  resolveRefinancing,
  updateHoundstooth,
  calculateFinancialOutcome,
  calculateGovernanceOutcome,
  calculateCounselorPerformance,
  reputationTier,
  validateEvidenceSelection,
  EVIDENCE,
  DOSSIERS,
  DIAGNOSES,
  TREATMENTS
});

render();
