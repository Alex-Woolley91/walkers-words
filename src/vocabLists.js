import vocabGCSELatin from './vocab.json'
import vocabASLatin from './vocab-as-latin.json'
import vocabASGreek from './vocab-as-greek.json'
import vocabGCSEGreek from './vocab-gcse-greek.json'

export const VOCAB_LISTS = {
  'gcse-latin':  { label: 'GCSE Latin (J282)',      vocab: vocabGCSELatin  },
  'as-latin':    { label: 'AS Latin (H043)',         vocab: vocabASLatin    },
  'as-greek':    { label: 'AS Greek (H044)',         vocab: vocabASGreek    },
  'gcse-greek':  { label: 'GCSE Greek (J292)',       vocab: vocabGCSEGreek  },
}

export const DEFAULT_VOCAB_LIST = 'gcse-latin'
