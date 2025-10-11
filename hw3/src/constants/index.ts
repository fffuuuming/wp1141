import type { TimeSlot, CollegeOption, DepartmentOption } from '../types';

// 時間區間資料
export const TIME_SLOTS: TimeSlot[] = [
  { value: '0', time: '7:10~8:00' },
  { value: '1', time: '8:10~9:00' },
  { value: '2', time: '9:10~10:00' },
  { value: '3', time: '10:20~11:10' },
  { value: '4', time: '11:20~12:10' },
  { value: '5', time: '12:20~13:10' },
  { value: '6', time: '13:20~14:10' },
  { value: '7', time: '14:20~15:10' },
  { value: '8', time: '15:30~16:20' },
  { value: '9', time: '16:30~17:20' },
  { value: '10', time: '17:30~18:20' },
  { value: 'A', time: '18:25~19:15' },
  { value: 'B', time: '19:20~20:10' },
  { value: 'C', time: '20:15~21:05' },
  { value: 'D', time: '21:10~22:00' }
];

// 星期選項
export const WEEKDAYS = ['週一', '週二', '週三', '週四', '週五', '週六'];

// 加選方式選項
export const ADD_METHODS = ['第1類', '第2類', '第3類'];

// 開課學院選項
export const COLLEGE_OPTIONS: CollegeOption[] = [
  { code: '', name: '全部' },
  { code: '1000', name: '1000 文學院' },
  { code: '2000', name: '2000 理學院' },
  { code: '3000', name: '3000 社會科學院' },
  { code: '4000', name: '4000 醫學院' },
  { code: '5000', name: '5000 工學院' },
  { code: '6000', name: '6000 生物資源暨農學院' },
  { code: '7000', name: '7000 管理學院' },
  { code: '8000', name: '8000 公共衛生學院' },
  { code: '9000', name: '9000 電機資訊學院' },
  { code: 'A000', name: 'A000 法律學院' },
  { code: 'B000', name: 'B000 生命科學院' },
  { code: 'C000', name: 'C000 國際政經學院' },
  { code: 'E000', name: 'E000 進修推廣學院' },
  { code: 'H000', name: 'H000 共同教育中心' },
  { code: 'I000', name: 'I000 國際學院' },
  { code: 'J000', name: 'J000 產業研發碩士專班' },
  { code: 'K000', name: 'K000 重點科技研究學院' },
  { code: 'Z000', name: 'Z000 創新設計學院' }
];

// 系所代碼選項
export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { code: '1010', name: '1010 中國文學系' },
  { code: '1011', name: '1011 中國文學系國際學生學士班' },
  { code: '1020', name: '1020 外國語文學系' },
  { code: '1030', name: '1030 歷史學系' },
  { code: '1040', name: '1040 哲學系' },
  { code: '1050', name: '1050 人類學系' },
  { code: '1060', name: '1060 圖書資訊學系' },
  { code: '1070', name: '1070 日本語文學系' },
  { code: '1090', name: '1090 戲劇學系' },
  { code: '2010', name: '2010 數學系' },
  { code: '2020', name: '2020 物理學系' },
  { code: '2030', name: '2030 化學系' },
  { code: '2040', name: '2040 地質科學系' },
  { code: '2070', name: '2070 心理學系' },
  { code: '2080', name: '2080 地理環境資源學系' },
  { code: '2090', name: '2090 大氣科學系' },
  { code: '3020', name: '3020 政治學系' },
  { code: '3021', name: '3021 政治學系 政治理論組' },
  { code: '3022', name: '3022 政治學系 國際關係組' },
  { code: '3023', name: '3023 政治學系 公共行政組' },
  { code: '3030', name: '3030 經濟學系' },
  { code: '3050', name: '3050 社會學系' },
  { code: '30A0', name: '30A0 社會科學院院學士學位' },
  { code: '3100', name: '3100 社會工作學系' },
  { code: '4010', name: '4010 醫學系' },
  { code: '4020', name: '4020 牙醫學系' },
  { code: '4030', name: '4030 藥學系' },
  { code: '4031', name: '4031 藥學系' },
  { code: '4040', name: '4040 醫學檢驗暨生物技術學系' },
  { code: '4060', name: '4060 護理學系' },
  { code: '4080', name: '4080 物理治療學系' },
  { code: '4081', name: '4081 物理治療學系' },
  { code: '4090', name: '4090 職能治療學系' },
  { code: '40A0', name: '40A0 醫學院院學士' },
  { code: '4120', name: '4120 學士後護理學系' },
  { code: '5010', name: '5010 土木工程學系' },
  { code: '5020', name: '5020 機械工程學系' },
  { code: '5040', name: '5040 化學工程學系' },
  { code: '5050', name: '5050 工程科學及海洋工程學系' },
  { code: '5070', name: '5070 材料科學與工程學系' },
  { code: '5080', name: '5080 醫學工程學系' },
  { code: '5090', name: '5090 智慧工程科技全英語學士學位學程' },
  { code: '50A0', name: '50A0 工學院院學士' },
  { code: '6010', name: '6010 農藝學系' },
  { code: '6020', name: '6020 生物環境系統工程學系' },
  { code: '6030', name: '6030 農業化學系' },
  { code: '6050', name: '6050 森林環境暨資源學系' },
  { code: '6060', name: '6060 動物科學技術學系' },
  { code: '6070', name: '6070 農業經濟學系' },
  { code: '6080', name: '6080 園藝暨景觀學系' },
  { code: '6090', name: '6090 獸醫學系' },
  { code: '60A0', name: '60A0 生物資源暨農學院院學士' },
  { code: '6100', name: '6100 生物產業傳播暨發展學系' },
  { code: '6110', name: '6110 生物機電工程學系' },
  { code: '6120', name: '6120 昆蟲學系' },
  { code: '6130', name: '6130 植物病理與微生物學系' },
  { code: '6150', name: '6150 生物科技與食品營養學士學位學程' },
  { code: '7010', name: '7010 工商管理學系' },
  { code: '7011', name: '7011 工商管理學系 企業管理組' },
  { code: '7012', name: '7012 工商管理學系 科技管理組' },
  { code: '7020', name: '7020 會計學系' },
  { code: '7030', name: '7030 財務金融學系' },
  { code: '7040', name: '7040 國際企業學系' },
  { code: '7050', name: '7050 資訊管理學系' },
  { code: '7060', name: '7060 企業管理學系' },
  { code: '8010', name: '8010 公共衛生學系' },
  { code: '9010', name: '9010 電機工程學系' },
  { code: '9020', name: '9020 資訊工程學系' },
  { code: 'A011', name: 'A011 法律學系 法學組' },
  { code: 'A012', name: 'A012 法律學系 司法組' },
  { code: 'A013', name: 'A013 法律學系 財經法學組' },
  { code: 'B010', name: 'B010 生命科學系' },
  { code: 'B020', name: 'B020 生化科技學系' },
  { code: 'B0A0', name: 'B0A0 生命科學院院學士' },
  { code: 'H040', name: 'H040 國際體育運動事務學士學位學程' },
  { code: 'H050', name: 'H050 校學士' },
  { code: 'H060', name: 'H060 國際半導體學士學位學程' },
  { code: 'O010', name: 'O010 國際事務處' },
  { code: 'O020', name: 'O020 國際學院' },
  { code: 'Z010', name: 'Z010 創新領域學士學位學程' }
];

// 搜尋方法選項
export const SEARCH_METHOD_OPTIONS = [
  { value: 'courseName', label: '課程名稱' },
  { value: 'teacherName', label: '教師姓名' },
  { value: 'courseCode', label: '課號' },
  { value: 'serialNumber', label: '流水號' },
  { value: 'courseId', label: '課程識別碼' }
];

// 課程類型選項
export const COURSE_TYPE_OPTIONS = [
  { value: 'required', label: '必修' },
  { value: 'elective', label: '選修' },
  { value: 'all', label: '全部' }
];

// 預設分頁大小
export const DEFAULT_PAGE_SIZE = 15;

// 分頁大小選項
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 50];

// CSV 檔案路徑
export const CSV_FILE_PATH = '/hw3-ntucourse-data-1002.csv';
