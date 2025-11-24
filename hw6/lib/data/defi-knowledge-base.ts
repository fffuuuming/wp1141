import type { KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';

export interface KnowledgeBaseItem {
  question: string;
  answer: string;
  category: KnowledgeBaseCategory;
  metadata?: {
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

/**
 * DeFi Knowledge Base
 * Contains 40 Q&A pairs covering DeFi concepts
 * Expanded for Phase 5.1: Testing & Optimization
 */
export const INITIAL_KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // DeFi Basics (10 items)
  {
    question: '什麼是 DeFi？',
    answer:
      'DeFi（Decentralized Finance，去中心化金融）是指建立在區塊鏈上的金融服務系統，不需要傳統金融機構作為中介。DeFi 使用智能合約來執行金融交易，包括借貸、交易、保險等服務。主要特點是開放性、透明性和可互操作性。',
    category: 'defi-basics',
    metadata: {
      tags: ['基礎概念', '定義'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'DeFi 和傳統金融有什麼不同？',
    answer:
      'DeFi 和傳統金融的主要差異包括：1) 去中心化：不需要銀行或金融機構作為中介；2) 開放性：任何人都可以參與，無需許可；3) 透明性：所有交易記錄在區塊鏈上公開可查；4) 可互操作性：不同 DeFi 協議可以互相整合；5) 24/7 運作：不受傳統銀行營業時間限制。',
    category: 'defi-basics',
    metadata: {
      tags: ['比較', '特點'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'DeFi 的主要優勢是什麼？',
    answer:
      'DeFi 的主要優勢包括：1) 金融包容性：任何人都可以參與，無需銀行帳戶；2) 透明度：所有交易公開可查；3) 可編程性：智能合約可以自動執行複雜的金融邏輯；4) 無需許可：不需要中介機構批准；5) 全球化：不受地理限制；6) 可組合性：不同協議可以組合使用。',
    category: 'defi-basics',
    metadata: {
      tags: ['優勢', '好處'],
      difficulty: 'beginner',
    },
  },
  {
    question: '什麼是去中心化？',
    answer:
      '去中心化是指沒有單一中央權威機構控制系統的運作。在 DeFi 中，去中心化意味著：1) 沒有單一實體控制資金或決策；2) 系統由分散的節點網路維護；3) 規則由智能合約自動執行；4) 用戶直接控制自己的資產。這與傳統金融系統由銀行或政府控制的中心化模式形成對比。',
    category: 'defi-basics',
    metadata: {
      tags: ['基礎概念', '去中心化'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'DeFi 生態系統包含哪些主要組件？',
    answer:
      'DeFi 生態系統主要包含：1) 去中心化交易所（DEX）：如 Uniswap、SushiSwap；2) 借貸協議：如 Aave、Compound；3) 流動性挖礦：提供流動性獲得獎勵；4) 穩定幣：如 USDC、DAI；5) 衍生品平台：期貨、期權交易；6) 保險協議：為 DeFi 風險提供保障；7) 聚合器：整合多個協議的服務。',
    category: 'defi-basics',
    metadata: {
      tags: ['生態系統', '組件'],
      difficulty: 'beginner',
    },
  },

  // DeFi Basics - Additional (5 more items)
  {
    question: 'DeFi 是如何運作的？',
    answer:
      'DeFi 運作基於區塊鏈技術和智能合約：1) 智能合約：自動執行的程式碼，定義金融服務的規則；2) 區塊鏈：提供去中心化的帳本記錄所有交易；3) 代幣：作為價值的載體和交易媒介；4) 協議：不同 DeFi 應用提供各種金融服務；5) 錢包：用戶連接協議和管理資產的工具。所有操作都是點對點進行，無需傳統金融中介。',
    category: 'defi-basics',
    metadata: {
      tags: ['運作機制', '原理'],
      difficulty: 'beginner',
    },
  },
  {
    question: '穩定幣在 DeFi 中扮演什麼角色？',
    answer:
      '穩定幣在 DeFi 中扮演關鍵角色：1) 價值儲存：提供價格穩定的資產，避免加密貨幣波動；2) 交易媒介：作為 DEX 中的交易對，提供流動性；3) 借貸抵押：作為借貸協議的抵押品和借出資產；4) 收益工具：存入協議獲得穩定收益；5) 避險工具：在市場波動時保護資產價值。常見穩定幣包括 USDC、USDT、DAI 等。',
    category: 'defi-basics',
    metadata: {
      tags: ['穩定幣', '角色'],
      difficulty: 'beginner',
    },
  },
  {
    question: '什麼是智能合約？',
    answer:
      '智能合約是自動執行的程式碼，部署在區塊鏈上，當滿足特定條件時自動執行預定義的操作。在 DeFi 中，智能合約用於：1) 自動化交易：無需人工干預執行交易；2) 借貸協議：自動管理抵押和清算；3) 流動性池：自動計算價格和分配收益；4) 治理投票：自動執行投票結果。智能合約一旦部署就無法修改，確保規則的透明性和不可篡改性。',
    category: 'defi-basics',
    metadata: {
      tags: ['智能合約', '基礎概念'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'DeFi 的參與者有哪些？',
    answer:
      'DeFi 生態系統的主要參與者包括：1) 流動性提供者：提供資金到流動性池獲得收益；2) 交易者：在 DEX 上進行代幣交易；3) 借貸者：抵押資產借出其他代幣；4) 存款者：存入資產獲得利息；5) 開發者：創建和維護 DeFi 協議；6) 治理代幣持有者：參與協議治理決策；7) 審計公司：審查智能合約安全性；8) 聚合器：整合多個協議提供優化服務。',
    category: 'defi-basics',
    metadata: {
      tags: ['參與者', '生態系統'],
      difficulty: 'beginner',
    },
  },
  {
    question: '為什麼 DeFi 被稱為「可組合的」？',
    answer:
      'DeFi 被稱為「可組合的」是因為不同的協議可以像樂高積木一樣組合使用。例如：1) 在 Aave 借出資產 → 存入 Compound 獲得更高收益；2) 在 Uniswap 提供流動性 → 將 LP 代幣存入 Yearn 自動優化收益；3) 使用聚合器整合多個協議找到最佳利率。這種可組合性創造了「貨幣樂高」效應，讓開發者可以快速創建新的金融產品，用戶可以組合使用多個協議獲得最佳體驗。',
    category: 'defi-basics',
    metadata: {
      tags: ['可組合性', '貨幣樂高'],
      difficulty: 'intermediate',
    },
  },

  // DEX (8 items)
  {
    question: '什麼是 DEX（去中心化交易所）？',
    answer:
      'DEX（Decentralized Exchange，去中心化交易所）是建立在區塊鏈上的交易平台，允許用戶直接進行加密貨幣交易，無需中央機構作為中介。DEX 使用智能合約和自動化做市商（AMM）機制來匹配買賣雙方。用戶保持對自己資金的控制，交易直接在區塊鏈上執行。',
    category: 'dex',
    metadata: {
      tags: ['DEX', '交易所'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'DEX 和 CEX 的差異是什麼？',
    answer:
      'DEX（去中心化交易所）和 CEX（中心化交易所）的主要差異：1) 控制權：DEX 用戶控制私鑰，CEX 由平台保管資金；2) 透明度：DEX 交易公開透明，CEX 內部運作不透明；3) 審查：DEX 無需許可，CEX 可能限制某些用戶；4) 安全性：DEX 風險在智能合約，CEX 風險在平台被駭；5) 流動性：CEX 通常流動性更高，DEX 依賴流動性池。',
    category: 'dex',
    metadata: {
      tags: ['DEX', 'CEX', '比較'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'Uniswap 如何運作？',
    answer:
      'Uniswap 是一個去中心化交易所，使用自動化做市商（AMM）機制運作：1) 流動性池：用戶提供代幣對（如 ETH/USDC）到流動性池；2) 恆定乘積公式：使用 x * y = k 公式計算價格；3) 交易：用戶直接與流動性池交易，無需訂單簿；4) 手續費：交易收取 0.05%-1% 手續費，分配給流動性提供者；5) 無需許可：任何人都可以添加流動性或交易。',
    category: 'dex',
    metadata: {
      tags: ['Uniswap', 'AMM', '運作機制'],
      difficulty: 'intermediate',
    },
  },

  // DEX - Additional (5 more items)
  {
    question: '什麼是 AMM（自動化做市商）？',
    answer:
      'AMM（Automated Market Maker，自動化做市商）是 DEX 使用的定價機制，取代傳統的訂單簿模式。AMM 使用數學公式（如恆定乘積公式 x * y = k）自動計算代幣價格。流動性提供者將代幣對存入流動性池，交易者直接與池子交易。價格由池中代幣比例決定，交易會改變比例從而改變價格。這種機制讓 DEX 可以 24/7 運作，無需傳統做市商。',
    category: 'dex',
    metadata: {
      tags: ['AMM', '做市商', '機制'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '滑點是什麼？如何在 DEX 交易中減少滑點？',
    answer:
      '滑點是指預期交易價格與實際執行價格的差異。在 DEX 中，大額交易會改變流動性池的比例，導致價格變化產生滑點。減少滑點的方法：1) 選擇流動性高的交易對；2) 將大額交易拆分為多筆小額交易；3) 使用限價單功能（如果協議支持）；4) 選擇較低滑點容忍度，交易失敗但避免損失；5) 在流動性高的時段交易。滑點是 AMM 機制的固有特性，無法完全避免。',
    category: 'dex',
    metadata: {
      tags: ['滑點', '交易策略'],
      difficulty: 'intermediate',
    },
  },
  {
    question: 'SushiSwap 和 Uniswap 有什麼不同？',
    answer:
      'SushiSwap 和 Uniswap 都是基於 AMM 的 DEX，主要差異：1) 代幣經濟：SushiSwap 發行 SUSHI 治理代幣，Uniswap 後來發行 UNI；2) 收益分配：SushiSwap 將部分手續費分配給 SUSHI 質押者；3) 治理模式：SushiSwap 更注重社區治理；4) 功能：SushiSwap 提供更多功能如借貸、槓桿交易；5) 流動性：Uniswap 通常有更高的總鎖倉價值（TVL）。兩者都使用類似的 AMM 機制，但在代幣經濟和功能上有所不同。',
    category: 'dex',
    metadata: {
      tags: ['SushiSwap', 'Uniswap', '比較'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是流動性池？',
    answer:
      '流動性池是 DEX 中存放代幣對的智能合約，用於提供交易所需的流動性。例如 ETH/USDC 池包含等值的 ETH 和 USDC。流動性提供者（LP）將代幣存入池中，獲得 LP 代幣作為憑證。當交易發生時，交易者從池中取出代幣，支付手續費給 LP。池子越大，流動性越高，滑點越小。LP 可以隨時贖回 LP 代幣取回自己的代幣份額和累積的手續費。',
    category: 'dex',
    metadata: {
      tags: ['流動性池', 'LP', '基礎概念'],
      difficulty: 'beginner',
    },
  },
  {
    question: '在 DEX 交易需要支付哪些費用？',
    answer:
      '在 DEX 交易通常需要支付：1) 交易手續費：通常為交易金額的 0.05%-1%，分配給流動性提供者；2) Gas 費：區塊鏈網路費用，用於執行智能合約，費用高低取決於網路擁堵程度；3) 滑點成本：大額交易可能產生的價格差異。不同 DEX 的手續費率不同，例如 Uniswap V3 提供 0.05%、0.3%、1% 三個費率等級。Gas 費在以太坊上較高，在 Layer 2 或低費用鏈上較低。',
    category: 'dex',
    metadata: {
      tags: ['費用', '手續費', 'Gas'],
      difficulty: 'beginner',
    },
  },

  // Liquidity Mining (6 items)
  {
    question: '什麼是流動性挖礦？',
    answer:
      '流動性挖礦（Liquidity Mining）是指用戶將加密貨幣存入 DeFi 協議的流動性池，以獲得獎勵代幣的過程。用戶提供流動性後，除了獲得交易手續費分成外，還能獲得協議發行的治理代幣作為額外獎勵。這是 DeFi 協議吸引流動性和用戶參與的主要機制之一。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['流動性挖礦', '獎勵'],
      difficulty: 'beginner',
    },
  },
  {
    question: 'APY 和 APR 有什麼不同？',
    answer:
      'APR（Annual Percentage Rate，年化利率）是簡單的年化收益率，不考慮複利。APY（Annual Percentage Yield，年化收益率）則考慮複利效果。例如，如果 APR 是 12%，每月複利，APY 會更高（約 12.68%）。在 DeFi 中，APY 通常更準確地反映實際收益，因為收益會自動再投資產生複利效果。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['APY', 'APR', '收益率'],
      difficulty: 'beginner',
    },
  },
  {
    question: '流動性挖礦有什麼風險？',
    answer:
      '流動性挖礦的主要風險包括：1) 無常損失：當代幣價格波動時，流動性提供者可能遭受損失；2) 智能合約風險：協議可能被駭客攻擊或存在漏洞；3) 代幣價格風險：獎勵代幣價格可能大幅下跌；4) 流動性風險：可能難以快速退出；5) 監管風險：法規變化可能影響協議運作。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['風險', '流動性挖礦'],
      difficulty: 'intermediate',
    },
  },

  // Liquidity Mining - Additional (3 more items)
  {
    question: '如何計算流動性挖礦的收益？',
    answer:
      '流動性挖礦收益通常包括：1) 交易手續費分成：根據提供的流動性比例獲得交易手續費；2) 治理代幣獎勵：協議發放的額外代幣獎勵；3) 複利效果：將收益再投資可以產生複利。計算公式：總收益 = 手續費收益 + 代幣獎勵價值。APY（年化收益率）會考慮複利，通常高於 APR。收益會受到代幣價格波動、無常損失、協議參數調整等因素影響，實際收益可能與預期不同。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['收益計算', 'APY'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是無常損失？',
    answer:
      '無常損失（Impermanent Loss）是指流動性提供者因代幣價格變化而相較於單純持有代幣所遭受的損失。當代幣對中一個代幣價格上漲或下跌時，AMM 機制會自動調整池中代幣比例，導致 LP 取回時獲得的代幣價值低於直接持有。無常損失在價格回到初始比例時會消失，但如果價格持續偏離，損失會變成永久性的。這是流動性提供者需要考慮的主要風險之一。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['無常損失', '風險'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '流動性挖礦和質押有什麼不同？',
    answer:
      '流動性挖礦和質押的主要差異：1) 流動性挖礦：提供代幣對到流動性池，獲得交易手續費和獎勵代幣，面臨無常損失風險；2) 質押：鎖定單一代幣獲得獎勵，通常沒有無常損失，但代幣被鎖定無法交易。流動性挖礦通常收益更高但風險更大，質押收益較穩定但可能較低。兩者都是 DeFi 中獲得被動收益的方式，選擇取決於風險承受能力和收益目標。',
    category: 'liquidity-mining',
    metadata: {
      tags: ['流動性挖礦', '質押', '比較'],
      difficulty: 'beginner',
    },
  },

  // Lending (6 items)
  {
    question: '什麼是借貸協議？',
    answer:
      '借貸協議是 DeFi 中的去中心化借貸平台，允許用戶存入加密貨幣獲得利息，或抵押加密貨幣借出其他代幣。主要特點：1) 超額抵押：借貸需要提供超過借款價值的抵押品；2) 自動清算：當抵押率過低時自動清算；3) 即時借貸：無需審核，智能合約自動執行；4) 利率由供需決定：根據資金池利用率動態調整。',
    category: 'lending',
    metadata: {
      tags: ['借貸', '協議'],
      difficulty: 'beginner',
    },
  },
  {
    question: '超額抵押是什麼？',
    answer:
      '超額抵押是指借貸時提供的抵押品價值必須高於借款金額。例如，要借出價值 100 美元的穩定幣，可能需要抵押價值 150 美元的 ETH（150% 抵押率）。這是為了保護借貸協議，當抵押品價格下跌時，仍有足夠價值覆蓋借款。如果抵押率低於閾值（如 110%），系統會自動清算抵押品。',
    category: 'lending',
    metadata: {
      tags: ['超額抵押', '抵押率'],
      difficulty: 'beginner',
    },
  },

  // Lending - Additional (4 more items)
  {
    question: 'Aave 和 Compound 有什麼不同？',
    answer:
      'Aave 和 Compound 都是主要借貸協議，主要差異：1) 利率模型：Aave 使用更靈活的利率模型，Compound 使用線性模型；2) 功能：Aave 提供閃電貸、利率切換等進階功能；3) 代幣：Aave 發行 AAVE 代幣，Compound 發行 COMP；4) 抵押率：兩者的抵押率要求不同；5) 支持的資產：支持的代幣種類和數量不同；6) 治理：治理機制和社區參與度不同。兩者都提供類似的借貸服務，但各有特色。',
    category: 'lending',
    metadata: {
      tags: ['Aave', 'Compound', '比較'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是清算？如何避免被清算？',
    answer:
      '清算是當抵押品價值下跌，抵押率低於安全閾值時，協議自動出售抵押品償還借款的過程。避免清算的方法：1) 維持高抵押率：提供超過最低要求的抵押品；2) 監控抵押率：定期檢查抵押率，避免接近清算線；3) 及時補充抵押品：當價格下跌時增加抵押品；4) 償還部分借款：降低借款金額提高抵押率；5) 使用價格穩定的抵押品：選擇波動較小的資產作為抵押。清算會產生額外費用，應盡量避免。',
    category: 'lending',
    metadata: {
      tags: ['清算', '風險管理'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '借貸協議的利率是如何決定的？',
    answer:
      '借貸協議的利率由供需關係動態決定：1) 利用率：資金池的使用率越高，借貸利率越高；2) 供應量：資金池中可借資金越多，利率越低；3) 需求：借貸需求越高，利率越高；4) 協議參數：每個協議設定的基礎利率和調整參數。大多數協議使用線性或曲線模型計算利率，當利用率達到特定閾值（如 80%）時，利率會急劇上升以吸引更多供應。利率會根據市場條件實時調整。',
    category: 'lending',
    metadata: {
      tags: ['利率', '機制'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是閃電貸？',
    answer:
      '閃電貸（Flash Loan）是一種無需抵押品的即時借貸，但必須在同一筆交易中歸還。特點：1) 無需抵押：不需要提供任何抵押品；2) 即時歸還：必須在同一區塊交易中歸還；3) 手續費：通常收取少量手續費（如 0.09%）；4) 用途：主要用於套利、債務重組、套期保值等策略。如果無法在同一交易中歸還，整個交易會回滾，資金安全有保障。閃電貸展示了 DeFi 的可組合性和創新性。',
    category: 'lending',
    metadata: {
      tags: ['閃電貸', '進階功能'],
      difficulty: 'advanced',
    },
  },

  // Risks (6 items)
  {
    question: 'DeFi 的主要風險是什麼？',
    answer:
      'DeFi 的主要風險包括：1) 智能合約風險：代碼漏洞可能導致資金損失；2) 無常損失：流動性提供者面臨的價格風險；3) 監管風險：法規變化可能影響協議運作；4) 流動性風險：市場波動時可能無法及時退出；5) 私鑰風險：私鑰丟失或被盜無法恢復；6) 協議風險：協議可能被駭或管理不善。',
    category: 'risks',
    metadata: {
      tags: ['風險', '安全'],
      difficulty: 'beginner',
    },
  },
  {
    question: '如何避免智能合約風險？',
    answer:
      '降低智能合約風險的方法：1) 選擇經過審計的協議：查看是否有專業安全公司審計報告；2) 分散投資：不要將所有資金投入單一協議；3) 從小額開始：先測試小額資金；4) 關注協議聲譽：選擇知名且運作時間長的協議；5) 了解協議機制：理解協議如何運作；6) 監控安全事件：關注協議的安全公告和漏洞報告。',
    category: 'risks',
    metadata: {
      tags: ['風險管理', '安全'],
      difficulty: 'intermediate',
    },
  },
  // Risks - Additional (4 more items)
  {
    question: '什麼是私鑰風險？如何保護私鑰？',
    answer:
      '私鑰風險是指私鑰丟失或被盜導致資產永久損失的風險。保護私鑰的方法：1) 使用硬體錢包：將私鑰存儲在離線設備中；2) 備份助記詞：安全保存助記詞，不要存儲在線上；3) 多重簽名：使用需要多個簽名才能執行的錢包；4) 不要分享私鑰：永遠不要將私鑰告訴任何人或輸入到可疑網站；5) 使用正版錢包：只使用官方或經過驗證的錢包應用；6) 定期檢查：定期檢查錢包活動，發現異常及時處理。私鑰一旦丟失無法恢復，保護私鑰是 DeFi 安全的第一要務。',
    category: 'risks',
    metadata: {
      tags: ['私鑰', '安全', '風險管理'],
      difficulty: 'beginner',
    },
  },
  {
    question: '如何識別 DeFi 詐騙項目？',
    answer:
      '識別 DeFi 詐騙項目的警示信號：1) 過高收益：承諾不切實際的高收益率（如日收益 10%）；2) 缺乏審計：沒有經過專業安全公司審計；3) 匿名團隊：團隊成員身份不明或無法驗證；4) 代幣經濟異常：代幣分配不合理，團隊持有過多；5) 代碼未開源：智能合約代碼不公開；6) 社群異常：社群充滿機器人或假帳號；7) 急迫感：催促立即投資，製造 FOMO；8) 複製項目：完全複製其他項目的代碼和設計。投資前應進行充分研究，只投資經過驗證的項目。',
    category: 'risks',
    metadata: {
      tags: ['詐騙', '安全', '識別'],
      difficulty: 'beginner',
    },
  },
  {
    question: '監管風險對 DeFi 有什麼影響？',
    answer:
      '監管風險可能對 DeFi 產生的影響：1) 合規要求：可能需要 KYC/AML 驗證；2) 服務限制：某些地區可能禁止或限制 DeFi 服務；3) 稅務影響：需要遵守當地稅務法規；4) 協議變更：協議可能需要調整以符合監管要求；5) 流動性影響：監管不確定性可能影響市場參與；6) 創新限制：過度監管可能限制創新。不同國家對 DeFi 的監管態度不同，投資者應了解當地法規，選擇合規的協議和服務。',
    category: 'risks',
    metadata: {
      tags: ['監管', '法規', '風險'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是重入攻擊？如何防範？',
    answer:
      '重入攻擊（Reentrancy Attack）是一種智能合約漏洞，攻擊者在合約執行完成前重複調用函數來提取資金。防範方法：1) 檢查-效果-交互模式：先更新狀態再進行外部調用；2) 重入鎖：使用鎖定機制防止重複執行；3) 使用經過驗證的庫：使用 OpenZeppelin 等經過審計的庫；4) 外部調用限制：限制外部合約調用的權限；5) 代碼審計：進行專業的安全審計。重入攻擊是 DeFi 歷史上造成最大損失的攻擊類型之一，開發者必須嚴格防範。',
    category: 'risks',
    metadata: {
      tags: ['重入攻擊', '安全漏洞', '防範'],
      difficulty: 'advanced',
    },
  },

  // Smart Contracts (4 items)
  {
    question: '智能合約如何確保安全性？',
    answer:
      '確保智能合約安全性的方法：1) 代碼審計：由專業安全公司進行全面審計；2) 形式化驗證：使用數學方法驗證代碼正確性；3) 漏洞賞金：設立獎金鼓勵發現漏洞；4) 漸進式部署：先在測試網測試，再逐步部署到主網；5) 多重簽名：重要操作需要多個簽名；6) 時間鎖：重大變更設置延遲執行；7) 代碼開源：公開代碼接受社區審查；8) 保險：購買 DeFi 保險降低風險。即使經過審計的合約也可能存在未知漏洞，用戶應分散風險。',
    category: 'smart-contracts',
    metadata: {
      tags: ['智能合約', '安全', '最佳實踐'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是 Gas 費？如何降低 Gas 費用？',
    answer:
      'Gas 費是執行區塊鏈操作（如交易、智能合約調用）需要支付的網路費用。降低 Gas 費的方法：1) 選擇低費用鏈：使用 Layer 2（如 Arbitrum、Optimism）或低費用鏈（如 Polygon、BSC）；2) 選擇低 Gas 時段：在網路不擁堵時交易；3) 批量操作：將多個操作合併為一筆交易；4) 使用 Gas 優化工具：使用聚合器找到最優 Gas 價格；5) 避免複雜操作：簡單操作消耗更少 Gas；6) 使用預測：設置合理的 Gas 價格避免交易失敗。Gas 費在以太坊主網上較高，是 DeFi 用戶的主要成本之一。',
    category: 'smart-contracts',
    metadata: {
      tags: ['Gas', '費用', '優化'],
      difficulty: 'beginner',
    },
  },
  {
    question: '智能合約可以修改嗎？',
    answer:
      '智能合約一旦部署到區塊鏈，代碼通常無法修改，這是區塊鏈不可變性的體現。但有些協議使用可升級合約模式：1) 代理模式：使用代理合約指向可升級的實現合約；2) 多重簽名：重要變更需要多個簽名批准；3) 時間鎖：變更設置延遲執行，給用戶時間反應；4) 治理投票：通過代幣持有者投票決定是否升級。可升級合約提供了靈活性，但也增加了中心化風險。用戶應關注協議的升級機制和治理過程。',
    category: 'smart-contracts',
    metadata: {
      tags: ['智能合約', '可升級', '治理'],
      difficulty: 'intermediate',
    },
  },
  {
    question: '什麼是事件（Event）？為什麼重要？',
    answer:
      '事件（Event）是智能合約發送到區塊鏈日誌的數據，用於記錄合約狀態變化。重要性：1) 透明度：公開記錄所有重要操作；2) 監控：前端應用可以監聽事件更新 UI；3) 審計：可以追蹤所有歷史操作；4) 索引：可以快速查詢特定操作；5) 通知：可以觸發外部系統的通知。在 DeFi 中，事件用於記錄存款、提款、交易、清算等重要操作，是用戶和開發者了解協議活動的主要方式。',
    category: 'smart-contracts',
    metadata: {
      tags: ['事件', 'Event', '技術概念'],
      difficulty: 'intermediate',
    },
  },
];

