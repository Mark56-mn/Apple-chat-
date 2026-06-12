import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { Activity, AlertTriangle, ArrowDown, ArrowUp, Wallet, Share2, Rewind } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PieWallet({ userId }: { userId: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [amount, setAmount] = useState(0.1);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#F23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
    });

    seriesRef.current = candlestickSeries;

    // Fetch initial historical data via Binance REST
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100')
      .then((res) => res.json())
      .then((data) => {
        const historicalData: CandlestickData[] = data.map((d: any) => ({
          time: (d[0] / 1000) as Time,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        candlestickSeries.setData(historicalData);
        if (historicalData.length > 0) setCurrentPrice(historicalData[historicalData.length - 1].close);
      })
      .catch(console.error);

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;
      const tick = {
        time: (kline.t / 1000) as Time,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };
      candlestickSeries.update(tick);
      setCurrentPrice(tick.close);
    };

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      chart.remove();
    };
  }, []);

  const [isReplaying, setIsReplaying] = useState(false);

  const handleShareSnapshot = async () => {
    if (!chartContainerRef.current) return;
    try {
      const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: '#131722' });
      const dataUrl = canvas.toDataURL('image/png');
      alert('Snapshot created! (In a full real-time flow, this sends as a message instantly)');
      // In real real-time you might emit to socket:
      // socket.emit('send_message', { type: 'chart_snapshot', mediaUrl: dataUrl })
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplayMode = async () => {
     if (isReplaying || !seriesRef.current) return;
     setIsReplaying(true);
     try {
       const res = await fetch('/api/trade/replay?date=2023-01-01'); // Hardcoded sample date for replay
       const data = await res.json();
       if (data.success && data.klines) {
         const replayData: CandlestickData[] = data.klines.map((d: any) => ({
           time: (d[0] / 1000) as Time,
           open: parseFloat(d[1]),
           high: parseFloat(d[2]),
           low: parseFloat(d[3]),
           close: parseFloat(d[4]),
         }));
         
         seriesRef.current.setData([]);
         let i = 0;
         const interval = setInterval(() => {
           if (i >= replayData.length) {
             clearInterval(interval);
             setIsReplaying(false);
             return;
           }
           seriesRef.current?.update(replayData[i]);
           setCurrentPrice(replayData[i].close);
           i++;
         }, 100); // 10x speed 
       }
     } catch (e) {
       setIsReplaying(false);
     }
  };

  const executeTrade = async (type: 'buy' | 'sell') => {
    setIsTrading(true);
    setTradeResult(null);
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assetSymbol: 'BTCUSDT', type, amount, currentPrice })
      });
      const data = await res.json();
      setTradeResult({ ...data, type });
    } catch (e) {
      console.error(e);
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131722] text-[#d1d4dc] font-sans">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-medium text-white">Pie Wallet</h2>
          <span className="bg-gray-800 text-xs px-2 py-1 rounded ml-2">BTC/USDT</span>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 mr-4">
              <button onClick={handleShareSnapshot} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white" title="Snapshot to Chat">
                 <Share2 className="w-4 h-4" />
              </button>
              <button onClick={handleReplayMode} disabled={isReplaying} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50" title="Replay Mode">
                 <Rewind className={`w-4 h-4 ${isReplaying ? 'animate-pulse text-yellow-500' : ''}`} />
              </button>
           </div>
           <div className="text-right">
             <div className={`text-xl font-bold ${currentPrice > 0 ? 'text-green-400' : 'text-gray-400'}`}>
               ${currentPrice.toFixed(2)}
             </div>
             <p className="text-xs text-gray-500">{isReplaying ? 'Replay Feed' : 'Live Binance Feed'}</p>
           </div>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-[#131722]" ref={chartContainerRef} style={{ minHeight: "350px" }} />

      <div className="p-6 border-t border-gray-800 bg-[#1e222d] overflow-y-auto">
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Order Size (BTC)</label>
          <div className="flex items-center bg-[#131722] rounded-lg p-3 ring-1 ring-gray-700 focus-within:ring-green-500">
            <span className="text-gray-500 mr-2">₿</span>
            <input 
               type="number"
               step="0.01"
               min="0.01"
               className="bg-transparent text-white outline-none w-full"
               value={amount}
               onChange={e => setAmount(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex text-xs text-gray-500 mt-2 space-x-4">
            <span>Est. Value: ${(currentPrice * amount).toFixed(2)}</span>
            <span>Fee tier: 0.1%</span>
          </div>
        </div>

        <div className="flex space-x-4">
           <button 
             onClick={() => executeTrade('buy')}
             disabled={isTrading}
             className="flex-1 bg-[#089981] hover:bg-[#078570] text-white py-3 rounded-lg font-bold uppercase disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
           >
             {isTrading ? <Activity className="w-5 h-5 animate-pulse" /> : <ArrowUp className="w-5 h-5" />}
             <span>Buy Market</span>
           </button>
           <button 
             onClick={() => executeTrade('sell')}
             disabled={isTrading}
             className="flex-1 bg-[#F23645] hover:bg-[#d6313f] text-white py-3 rounded-lg font-bold uppercase disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
           >
             {isTrading ? <Activity className="w-5 h-5 animate-pulse" /> : <ArrowDown className="w-5 h-5" />}
             <span>Sell Market</span>
           </button>
        </div>

        {tradeResult && (
           <div className={`mt-6 p-4 rounded-lg border ${tradeResult.success ? 'bg-[#131722] border-gray-700' : 'bg-red-900 border-red-500'}`}>
              <h3 className="font-bold flex items-center mb-2">
                 {tradeResult.type === 'buy' ? '🟢 Buy Executed' : '🔴 Sell Executed'} 
                 <span className="ml-2 text-xs font-normal bg-gray-800 px-2 py-0.5 rounded">
                   Delay: {tradeResult.latencyMs}ms
                 </span>
              </h3>
              
              <ul className="text-sm space-y-1 text-gray-300">
                 <li className="flex justify-between">
                    <span className="text-gray-500">Target Price:</span> 
                    <span>${tradeResult.originalPrice?.toFixed(2)}</span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-gray-500">Filled Price:</span> 
                    <span className={tradeResult.slippageApplied > 0 ? "text-red-400" : "text-white"}>
                       ${tradeResult.executionPrice?.toFixed(2)}
                    </span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-gray-500">Slippage Applied:</span> 
                    <span>{tradeResult.slippageApplied?.toFixed(2)}%</span>
                 </li>
                 <li className="flex justify-between border-t border-gray-800 mt-2 pt-2">
                    <span className="text-gray-500">Total Fees:</span> 
                    <span>${tradeResult.feesApplied?.toFixed(2)}</span>
                 </li>
              </ul>
              
              {(tradeResult.isPanicFee || tradeResult.isFlashCrash) && (
                 <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 flex flex-col space-y-1 items-start">
                    {tradeResult.isPanicFee && <p className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Large position penalty applied (2% hidden fee).</p>}
                    {tradeResult.isFlashCrash && <p className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Flash crash simulator triggered (-10% penalty).</p>}
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
