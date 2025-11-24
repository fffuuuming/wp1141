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
 * Initial DeFi Knowledge Base
 * Contains 15 Q&A pairs covering basic DeFi concepts
 */
export const INITIAL_KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // DeFi Basics (5 items)
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

  // DEX (3 items)
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

  // Liquidity Mining (3 items)
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

  // Lending (2 items)
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

  // Risks (2 items)
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
];

