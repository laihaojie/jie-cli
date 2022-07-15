#!/usr/bin/env node

import questions from './questions/index.js'

const answer = await questions()
console.log(answer)
