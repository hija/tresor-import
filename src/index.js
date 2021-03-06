import pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { parseComdirectActivity } from './brokers/comdirect'
import { parseTradeRepublicActivity } from './brokers/traderepublic'

const getActivity = (textArr) => {
  const broker = identifyBroker(textArr)

  if (broker === 'comdirect') {
    return parseComdirectActivity(textArr)
  } else if (broker === 'traderepublic') {
    return parseTradeRepublicActivity(textArr)
  } else {
    console.log('Unsupported broker')
    return;
  }
}

const identifyBroker = (textArr) => {
  const isComdirect = textArr.some(t => t.includes('comdirect bank'));
  const isTradeRepublic = textArr.some(t => t.includes('TRADE REPUBLIC BANK GMBH'));
  if (isComdirect) {
    return 'comdirect'
  } if (isTradeRepublic) {
    return 'traderepublic'
  }
  else {
    return;
  }
}

export const extractActivity = async (e) => {
  let activity;
  let textArr;

  const result = new Uint8Array(e.currentTarget.result);
  const pdf = await pdfjs.getDocument(result).promise;
  const page = await pdf.getPage(1);
  const tc = await page.getTextContent();

  var out = [];
  for (let c of tc.items) {
    out.push(c.str.trim());
  }
  textArr = out.filter(i => i.length > 0);
  console.log(textArr);

  try {
    activity = getActivity(textArr)
  } catch (error) {
    console.error(error)
  }

  if (!activity) {
    activity = { parserError: true };
  }

  return activity
}