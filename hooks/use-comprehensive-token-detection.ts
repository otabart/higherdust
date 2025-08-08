"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'

interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  price?: number
  source: string
}

interface TokenBalance {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: bigint
  balanceFormatted: string
  price?: number
  valueUSD?: number
  source: string
}

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Cache for token detection results
const MEMORY_CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
let memoryCache: {
  [userAddress: string]: {
    tokens: TokenBalance[]
    timestamp: number
  }
} = {}

export function useComprehensiveTokenDetection() {
  const { address: userAddress, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check for cached tokens
  const getCachedTokens = useCallback((): TokenBalance[] | null => {
    if (!userAddress) return null
    
    const cached = memoryCache[userAddress.toLowerCase()]
    if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_DURATION) {
      return cached.tokens
    }
    
    return null
  }, [userAddress])

  // Fetch ALL tokens from user's wallet (no filtering)
  const fetchAllWalletTokens = useCallback(async (signal: AbortSignal): Promise<{address: string, balance: bigint}[]> => {
    if (!publicClient || !userAddress) {
      return []
    }

    try {
      console.log('🔍 Scanning wallet for ALL tokens...')
      
      // Get token balances in batches
      const batchSize = 50
      const allTokens: {address: string, balance: bigint}[] = []
      
      // Use our own API endpoint to get Base tokens (more reliable)
      const baseTokensResponse = await fetch('/api/tokens/detect?refresh=1', { signal })
      let knownBaseTokens: string[] = []
      
      if (baseTokensResponse.ok) {
        const baseTokensData = await baseTokensResponse.json()
        if (baseTokensData.tokens && Array.isArray(baseTokensData.tokens)) {
          knownBaseTokens = baseTokensData.tokens
            .map((token: any) => token.address)
            .filter((address: string) => address && address !== '0x0000000000000000000000000000000000000000')
            .slice(0, 500) // Limit to top 500 tokens for performance
        }
      }
      
      // Add major tokens and fallback list
      knownBaseTokens = [
        '0x0000000000000000000000000000000000000000', // ETH
        '0x4200000000000000000000000000000000000006', // WETH
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
        // Popular Base tokens as fallback
        '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe', // HIGHER
        '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
        '0x07d15798a67253d76cea61f0ea6f57aedc59dffb', // BASED
        '0x32e0f9d26d1e33625742a52620cc76c1130efde6', // BASED
        '0x28e29ec91db66733a94ee8e3b86a6199117baf99', // BASED
        '0xeab49138ba2ea6dd776220fe26b7b8e446638956', // SEND
        '0xa7ea9d5d4d4c7cf7dbde5871e6d108603c6942a5', // FOMO
        '0x0bf852ebb243b963652b71103a2b97cf446f22c3', // ROCKET
        '0x6b46eff16a97ee013fd5ac25a9601e7c29e43932', // ROCKET
        '0xa00fec55306c7843a31c6cafa82a95a32cfc64bc', // ROCKET
        '0x7e726e6f08ded7b87298b72d593caa460bd64bd8', // ROCKET
        '0xc19669a405067927865b40ea045a2baabbbe57f5', // STAR
        '0xccbb89c10b99f62b215eb509617e3d35b4d5e03c', // one
        '0xb3d4ae3709dcea485baa7b4db3fbd5d7a55a9406', // three
        '0x892af543cef98886de416cc5e47d0dabe90ef6ac', // four
        '0x7f5582f9e85ec23c69cc52a4685a9aae6162a4ff', // five
        '0x4d35b133b17d46d63c108c8bfc6acbfcbeaaa954', // five
        '0x44cfc17f7078d11a7f85463c17d90845d0e109c0', // six
        '0x9e01b3e0dde053c16a66a15ba6e4a47fb9533145', // seven
        '0x3f9ce84562936bb1e9c6064a37fda3663e5cbcf4', // SEVEN
        '0xa7378593fe983d86d2099bc313a21035c1102059', // eight
        '0x36f881cc8ceca057721eb289cafb308ed822eef8', // vlorenzofficial
        '0x2d445c85507b232b4e0d8d831247d7a053e6cbd5', // nine
        '0x1ae1695c977ee7d2991c5cb9c4d87eedb0e9f0b1', // FALSENINE
        '0x7f65323e468939073ef3b5287c73f13951b0ff5b', // BLUE
        '0xa89fc308f86af24c827bc01cc7bcd18172b7592b', // blue
        '0x9d0f188b8ab2e479b6fb138c7a538483a69e6668', // Blue
        '0x39d4d99fcaae7c014f122084ec3230a140163a41', // BLUE
        '0x072b89eb54af2dbc25013d497cd4420b1c5d9f31', // GREEN
        '0x2b3feb98b26394ff868977300eee04ee0e074847', // GREEN
        '0x3fb5e008f73d0c4615ee298015c79947053aeb07', // GREEN
        '0x14af6b11fde2b45aae7bf85355dcd5bcf4e787cb', // PINK
        '0x66fc31b3233c7c001bdd21ff6e5e66fa08ef85d0', // PINK
        '0x424d3ff690386cdc49cbd304070b10d206ddc5b7', // Pink
        '0x6c360e344b1d21919e3c76606896838b6a703c77', // misotasty
        '0x5717df4fec6684fcce8b8ae871691876c35ba7be', // evaevelina
        '0xafd9e9b987b67d4da05a859036b18d6c40ae55f6', // ceri
        '0xbefd5c25a59ef2c1316c5a4944931171f30cd3e4', // GOLD
        '0x26b845b905f6509cf253504d2370b5e540bf928b', // misotasty
        '0x02284d7ea8e830ddd6e1c08f0e1af1bcf72aa51c', // crossover
        '0x56cbaeda42e515a748d71aac73ae8cca793ab8f9', // adacrow
        '0x1fed4fe766cbbea95968d78e4c78ba3383a38453', // YOSHI
        '0x8feef9f0ffa554e51220a3391e7bb7560526a72a', // SAGE
        '0x67040bb0ad76236ddd5d156d23ec920a089d1eac', // lower
        '0x9edfba2d8c4ff4a13e0e8eedd0dd6b256df39819', // lower
        '0x3e12b9d6a4d12cd9b4a6d613872d0eb32f68b380', // FLOWER
        '0xb043bad01195700e737d0aee852584eae9393134', // FLOWER
        '0x4c96a67b0577358894407af7bc3158fc1dffbeb5', // POV
        '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', // VIRTUAL
        '0x47af6bd390d03e266eb87cab81aa6988b65d5b07', // CHESS
        '0x07a568a0c526b517dd53d7b6d824e85a3df1c1e0', // cocona_ai
        '0x1111111111166b7fe7bd91427724b487980afc69', // ZORA
        '0xcdb7331a00f119c5b9d64bbe950a9381c63e00a4', // ZORA
        '0x0fd122a924c4528a78a8141bddd38a0e5ba35fa5', // CREATOR
        '0x374f72bffde91e4ded768b4175efe507cbff8039', // endzyyy
        '0xa1832f7f4e534ae557f9b5ab76de54b1873e498b', // BID
        '0x655bcaaf531c90b85db0ecdd4693d1d562d66d96', // deployer
        '0xeb70b50cb337ff64663cdb313169edb7a00e0b07', // didyoudeploythetoken
        '0x22ba7bb7f829382a9ed24bc2a9cbbc8a400a9b07', // DDP
        '0x0fc7168288a4a43e2294130d3d5e4b06b913cb50', // justdeployit
        '0x8029a05383f4f4c24d222ab455cc8da940943bee', // bankr
        '0x475e372b23d75a745bceb431107167f2583ada4c', // DMND
        '0x18bc59d5f4be0903058b295515188ad7af307262', // DIAMOND
        '0x244418667cb3646a89b95e528ceee3323f9f7e68', // DIAMOND
        '0x490c96607e1a2a0361306020c0e19ad7fa449dda', // GEM
        '0xf945945452302e0d5d1741f0c51dd494427a7b07', // SHOT
        '0x1c4cca7c5db003824208adda61bd749e55f463a3', // GAME
        '0xfb6717742009e2cfd5a66186c939ac892c2a8654', // GAME
        '0x8761155c814c807cd3ccd15b256d69d3c10f198c', // JOY
        '0xf0992fe8401770721580891ea2c479cd1401dda2', // JOY
        '0xce17eae9eeda9cf24b4975b4ff36df528e9c675f', // alvarmahlberg
        '0x040b01e0ca70ea5ae45709851ea100ed4677d321', // 12345
        '0x1c0f0df77fab0080806134bbd66ae71cd13a0e55', // Smile
        '0x0c30f0b1a460656f95b7b58a3e2f26ebafb857f3', // menem
        '0x42fd20968e847f76e5a4d09f3a35bda8f9f9c3e7', // hani247
        '0xaae93f6c7f4ee4a6a400572360ffa93d5b101797', // LMNK
        '0xf437f28b364e4315f3680c750b93cb90fa0e6eae', // laughclips
        '0x40c2be587c8600e4942973ee5958755ee2fdba26', // motunrayo
        '0x63f103568dd2a2bc59da623dc5f73698d628d234', // stoneymcblaze
        '0xa2b59d7d0bef43901ef711040a3b6152f6e95408', // cameranightmare
        '0xa35a2c84ceabb32d713dcb4626dc84ddfce5ed4f', // Want it more casual
        '0x8dd7546f56a93ecf8ceb29b554c345bb023e9f30', // dance
        '0x8891217b1c2565cecee176fdb19afdfeff173b9d', // perfectprank
        '0xb666b69575edc00a66269530fc0a6d90e14e19e1', // vviitran
        '0x2598c30330d5771ae9f983979209486ae26de875', // AI
        '0x416b8ea4b63506784d8fabbd753a9ed19e3cbf1e', // AI
        '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9', // AI
        '0x708c2b2eeb9578dfe4020895139e88f7654647ff', // ROBOT
        '0x5ed8ba85d277c870eee77ee7a628e94d18bfe027', // Web3
        '0xf9761e9fe7d4bdfef4b5a09a1cd47f997fcb88e8', // Web3
        '0x8f219e405f5aa614424822130db7a61322ac1255', // Web3
        '0x8a29b3ab6453bf20c2969a423647ae6fb8556e12', // Web3
        '0x06e5a084aa35a6ae8df5ad5bfe02dbfdcd01c2e9', // DEFI
        '0xc40c7b7add2024a72b80b649e918040c1b218644', // frog
        '0x30b27a75962b811acd365ae3db4c773de6eacb03', // bird
        '0xc8e51fefd7d595c217c7ab641513faa4ad522b26', // CRAPPY
        '0xe25095f4b517ded82eeca62ebb8a9380ec8e1f0c', // #N9NE
        '0x478cd9057a8faabe063f880c2b3207c01b7172c7', // 1
        '0x1eb86a4dd8a298dd9ae3c161bd480ea8a4fb56c2', // worldinred
        '0x8ee1a65da3a3ebc399d30da1d1843776bc51dc7f', // earth
        '0x9d6501275e91c0b2b0845c2c5334dea1ec6a3c18', // EARTH
        '0xd27c288fd69f228e0c02f79e5ecadff962e05a2b', // FIRE
        '0x8d55663bf4bad78f15d4804fb46819c25d73f29d', // coffee
        '0x0fcec1c5a7550c96c6090c6c6f531948f633cefc', // mmp
        '0x11a3483bcb4b07595bd5c8180661b18a773629e9', // Juice
        '0x3f0051bbc78fbed6122dd099db23401adf4c32ab', // BEER
        '0xf426daeecf204f71dcabbca92e89db47b15cd141', // alexanderelorenzo
        '0x74d64182a9ff3f72cbef8661ded0d21e4b5d3911', // alexandretamara
        '0xd9ea811a51d6fe491d27c2a0442b3f577852874d', // BOB
        '0x0f884a04d15a3cf4aecda7de0288c3a611326839', // CJ
        '0x03f4ffd276b8cec710164323da8dea829bb8d78e', // jjjjjohn
        '0x40461291347e1ecbb09499f3371d3f17f10d7159', // SUEDE
        '0x39d13dfdb6ec13cfd6491ce5791bb9587d410029', // cabbage
        '0x1b68244b100a6713ca7f540697b1be12148a8bf9', // YES
        '0x3147f26685ac332c88679b4b98094c1f2f2f4899', // YES
        '0x66e727d436941899ed409339a15c18eabba5bc2c', // No
        '0x7863674bd32b5a0ceef6103bf13a9cd6117102a8', // No
        '0x6d581d3b414b57c52deeeb8b34fd801456be7e7d', // No
        '0x4425aec0f806f288e596bf0de36ac29f0c4cf062', // No
        '0x0361eb31d25c3c2c4de6e96ae2c4014557b04d14', // GO
        '0x445e9c0a296068dc4257767b5ed354b77cf513de', // up
        '0xac27fa800955849d6d17cc8952ba9dd6eaa66187', // UP
        '0x6440661de31f752673d33ff828a454eda456a3e5', // OUT
        '0x0adc87881b5970013bee20694e5493914fd7dd2e', // COIN
        '0xdc6d3d7611690d2aaed3496cd570b8e52625fa4f', // COIN
        '0x7300b37dfdfab110d83290a29dfb31b1740219fe', // MAMO
        '0xed6e000def95780fb89734c07ee2ce9f6dcaf110', // EDGE
        '0x820c5f0fb255a1d18fd0ebb0f1ccefbc4d546da7', // A0X
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
        '0x64fcc3a02eeeba05ef701b7eed066c6ebd5d4e51', // SPECTRA
        '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
        '0xcb585250f852c6c6bf90434ab21a00f02833a4af', // cbXRP
        '0x41e357ea17eed8e3ee32451f8e5cba824af58dbf', // cbXRP
        '0xebbf4c3a447dbcc1e1f59076aed36b0b0c10efaf', // VDT
        '0x02c1d787521c20586b4ab070b1838d91ff85d656', // FRLZ
        '0x042c3be653ab864e692efb3a9422ea7b923850ae', // HODL
        '0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00', // TIBBIR
        '0x8df1447f6b6033db748c4fd0370a2a3b1f887c6d', // OF
        '0x8e16d46cb2da01cdd49601ec73d7b0344969ae33', // coin
        '0x64cb1bafc59bf93aeb90676885c63540cf4f4106', // Coin
        '0xd758916365b361cf833bb9c4c465ecd501ddd984', // TOKEN
        '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
        '0x0000000000000000000000000000000000000000', // ETH
        '0x5eb7edfcad75415abb54c345a4ea6ec390f77207', // FORTUNE
        '0x589e4f8e250878d0f34df98557445f293052eeed', // FORTUNE
        '0x08ecc147ba8331df2848011dd816935f98e271ee', // MONEY
        '0x23408cd2250fbb36023361ffd8984bbd5290c04e', // Money
        '0x7404ac09adf614603d9c16a7ce85a1101f3514ba', // PLAY
        '0x9e30e5dbf54338bcdbdd0d6b03ed3751f9290b07', // PLAY
        '0x8f986497bb2676f72f3bac67add2f72efb1d76de', // Play
        '0xb166e8b140d35d9d8226e40c09f757bac5a4d87d', // NPC
        '0x51c26d919fd38e91b56302814b25131ee0183b07', // NFT
        '0xafb89a09d82fbde58f18ac6437b3fc81724e4df6', // DOG
        '0x9e53e88dcff56d3062510a745952dec4cefdff9e', // DOG
        '0x5812fb91b48467dbbe3394d6d3ef7be9707dcddf', // FISH
        '0xc933b6ba31c86d6b5a64ed380092e2b6d20e3283', // BULL
        '0xd3a2c33fac506b92ff94a68d355a1c8bb3902360', // BURGER
        '0x52c2b317eb0bb61e650683d2f287f56c413e4cf6', // TREE
        '0x6888c2409d48222e2cb738eb5a805a522a96ce80', // TREE
        '0x862a66689033fd03af3da0e625718d5d90563024', // water
        '0xeab5984b9c9c2ed328086a67f3d2190c42be2034', // creatordao
        '0xf26b302d83798d2cd093d4df05ae422024ac662f', // ZoraIndex
        '0x9edba99e4b9f911f6cc4b471f5c12358bd662c66', // qingthecreator
        '0xf433808c23f7f12ee41cce0f167460e594738222', // contencreatory
        ...knownBaseTokens
      ]
      
      for (let i = 0; i < knownBaseTokens.length; i += batchSize) {
        if (signal.aborted) throw new Error('Aborted')
        
        const batch = knownBaseTokens.slice(i, i + batchSize)
        const balancePromises = batch.map(async (address) => {
          try {
            const balance = await publicClient.readContract({
              address: address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [userAddress as `0x${string}`]
            })
            
            return { address, balance: balance as bigint }
          } catch (error) {
            // Token might not exist or have issues
            return null
          }
        })
        
        const batchResults = await Promise.allSettled(balancePromises)
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value && result.value.balance > BigInt(0)) {
            allTokens.push(result.value)
          }
        })
      }
      
      console.log(`💼 Found ${allTokens.length} tokens with balances > 0`)
      return allTokens
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching wallet tokens:', error)
      return []
    }
  }, [publicClient, userAddress])

  // Fetch token metadata (symbol, name, decimals) for given addresses
  const fetchTokenMetadata = useCallback(async (addresses: string[], signal: AbortSignal): Promise<Map<string, {symbol: string, name: string, decimals: number}>> => {
    if (!publicClient) {
      return new Map()
    }

    try {
      console.log(`📋 Fetching metadata for ${addresses.length} tokens...`)
      
      const metadataMap = new Map<string, {symbol: string, name: string, decimals: number}>()
      
      // ERC20 metadata ABI
      const metadataABI = [
        { name: 'symbol', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
        { name: 'name', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
        { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' }
      ] as const
      
      const metadataPromises = addresses.map(async (address) => {
        try {
          const [symbol, name, decimals] = await Promise.all([
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'symbol'
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'name'
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'decimals'
            })
          ])
          
          return {
            address: address.toLowerCase(),
            metadata: {
              symbol: symbol as string,
              name: name as string,
              decimals: decimals as number
            }
          }
        } catch (error) {
          // Token might not support metadata or have issues
          return {
            address: address.toLowerCase(),
            metadata: {
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              decimals: 18
            }
          }
        }
      })
      
      const results = await Promise.allSettled(metadataPromises)
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          metadataMap.set(result.value.address, result.value.metadata)
        }
      })
      
      console.log(`✅ Fetched metadata for ${metadataMap.size} tokens`)
      return metadataMap
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching token metadata:', error)
      return new Map()
    }
  }, [publicClient])

  // Check user token balances
  const fetchUserTokenBalances = useCallback(async (
    tokenAddresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, bigint>> => {
    if (!publicClient || !userAddress) {
      return new Map()
    }

    const batchSize = 30
    const balanceMap = new Map<string, bigint>()
    
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      if (signal.aborted) throw new Error('Aborted')
      
      const batch = tokenAddresses.slice(i, i + batchSize)
      
      // Parallel balance checks within batch with retry logic
      const balancePromises = batch.map(async (tokenAddress) => {
        let retries = 3
        let lastError: any
        
        while (retries > 0) {
          try {
            const balance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [userAddress as `0x${string}`],
            })
            
            const balanceBigInt = balance as bigint
            
            if (balanceBigInt > BigInt(0)) {
              return { address: tokenAddress, balance: balanceBigInt }
            } else {
              return { address: tokenAddress, balance: BigInt(0) }
            }
          } catch (error) {
            lastError = error
            retries--
            
            if (retries > 0) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
            }
          }
        }
        
        // All retries failed - skip this token
        console.warn(`Failed to get balance for ${tokenAddress} after 3 retries:`, lastError)
        return { address: tokenAddress, balance: BigInt(0) }
      })

      const results = await Promise.allSettled(balancePromises)
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.balance > BigInt(0)) {
          balanceMap.set(result.value.address, result.value.balance)
        }
      })
      
      // Minimal delay for RPC health
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    return balanceMap
  }, [publicClient, userAddress])



  // Validate tokens
  const validateTokens = useCallback((tokensWithBalances: TokenInfo[]): TokenInfo[] => {
    const validTokens = tokensWithBalances.filter(token => {
      return (
        token.address && 
        token.address.length === 42 && 
        token.address.startsWith('0x') &&
        token.symbol &&
        token.symbol.length > 0
      )
    })
    
    return validTokens
  }, [])

  // Fetch token prices
  const fetchLiveTokenPrices = useCallback(async (
    addresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, number>> => {
    if (addresses.length === 0) return new Map()
    
    try {
      const response = await fetch('/api/tokens/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
        signal
      })
      
      if (!response.ok) {
        throw new Error(`Price API failed: ${response.status}`)
      }
      
      const data = await response.json()
      const priceMap = new Map<string, number>()
      
      data.prices?.forEach((price: any) => {
        if (price.address && price.price) {
          priceMap.set(price.address.toLowerCase(), price.price)
        }
      })
      
      return priceMap
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching prices:', error)
      return new Map()
    }
  }, [])

  // Main detection function - NEW APPROACH: Wallet-first, then API validation
  const detectAllTokens = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !userAddress) {
      setTokens([])
      return
    }

    // Check for cached data (unless forcing refresh)
    if (!forceRefresh) {
      const cachedTokens = getCachedTokens()
      if (cachedTokens) {
        setTokens(cachedTokens)
        return
      }
    }

    // Abort any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Starting wallet-first token detection...')
      
      // Step 1: Get ALL tokens from user's wallet (no filtering yet)
      console.log('📱 Fetching ALL tokens from wallet...')
      const allWalletTokens = await fetchAllWalletTokens(signal)
      console.log(`💼 Found ${allWalletTokens.length} tokens in wallet`)
      
      if (allWalletTokens.length === 0) {
        setTokens([])
        setIsLoading(false)
        return
      }
      
      // Step 2: Get token metadata (symbol, name, decimals) for wallet tokens
      console.log('📋 Fetching token metadata...')
      const tokenMetadata = await fetchTokenMetadata(allWalletTokens.map(t => t.address), signal)
      
      // Step 3: Build complete token list with metadata
      const tokensWithMetadata = allWalletTokens.map(walletToken => {
        const metadata = tokenMetadata.get(walletToken.address.toLowerCase()) || {
          symbol: 'UNKNOWN',
          name: 'Unknown Token',
          decimals: 18
        }
        
        return {
          address: walletToken.address,
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: metadata.decimals,
          balance: walletToken.balance,
          balanceFormatted: formatUnits(walletToken.balance, metadata.decimals),
          price: 0, // Will be fetched in next step
          valueUSD: 0, // Will be calculated in next step
          source: 'wallet-first'
        }
      })
      
      console.log(`📊 Built ${tokensWithMetadata.length} tokens with metadata`)
      
      // Step 4: Fetch real prices for wallet tokens from APIs
      console.log('💰 Fetching real prices for wallet tokens...')
      const priceAddresses = tokensWithMetadata.map(token => token.address)
      const priceMap = await fetchLiveTokenPrices(priceAddresses, signal)
      
      // Step 5: Calculate USD values and filter by requirements
      const finalTokens: TokenBalance[] = tokensWithMetadata.map(token => {
        const price = priceMap.get(token.address.toLowerCase()) || 0
        const valueUSD = price * parseFloat(token.balanceFormatted)
        
        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance: token.balance,
          balanceFormatted: token.balanceFormatted,
          price,
          valueUSD,
          source: token.source
        }
      })
      
      // Step 6: Filter to tokens between $0.10-$5.00 USD (eligible range)
      const eligibleTokens = finalTokens.filter(token => {
        const value = token.valueUSD || 0
        return value >= 0.1 && value <= 5.0
      })
      
      console.log(`💸 Found ${eligibleTokens.length} tokens between $0.10-$5.00 USD`)
      
      // Cache the results
      if (userAddress) {
        memoryCache[userAddress.toLowerCase()] = {
          tokens: eligibleTokens,
          timestamp: Date.now()
        }
      }
      
      setTokens(eligibleTokens)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      console.error('Token detection error:', error)
      setError(error instanceof Error ? error.message : 'Failed to detect tokens')
      setTokens([])
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, userAddress, getCachedTokens, fetchAllWalletTokens, fetchTokenMetadata, fetchLiveTokenPrices])

  // Clear cache when user changes
  useEffect(() => {
    if (!userAddress) {
      setTokens([])
    }
  }, [userAddress])

  // Auto-detect when wallet connects
  useEffect(() => {
    if (isConnected && userAddress) {
      detectAllTokens()
    } else {
      setTokens([])
    }
  }, [isConnected, userAddress, detectAllTokens])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    tokens,
    isLoading,
    error,
    refetch: detectAllTokens,
  }
}