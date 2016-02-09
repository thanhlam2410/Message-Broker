"use strict";

exports.get = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  var consumers = qManager[qid].consumers
    .filter(function(consumer){ return consumer !== null;})
    .map(function(consumer){ consumer.queue_id = qid; return consumer;});

  return res.status(200).json(consumers);
};


exports.post = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  //TODO: Perhaps Callback_URL should be validated.  Do we make assumptions?
  var cb = req.body.callback_url;

  var q = qManager[qid];
  if (typeof q !== 'object')
    return res.status(410).json({ status: 'error', error: 'Queue not found' });
  
  var cid = q.consumers.length;
  qManager[qid].consumers.push({callback_url: cb, id: cid });

  return res.status(200).json({ status: 'ok' });
};


exports.delete = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  var cid = req.params.consumer_id;
  var q = qManager[qid];
  q.taskQueue.clearByCID(cid); // Deletes all messages for this consumer
  delete q.consumers[cid];

  return res.status(200).json({ status: 'ok' });
};
