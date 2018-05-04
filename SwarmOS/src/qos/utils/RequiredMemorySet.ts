Memory.qos.scheduler = {
    processes: {
        'index': {},
        'running': false,
        'completed': [],
        'queues': {},
        'sleep': {}
    }
};

Memory.sos = {};
Memory.sos.cache = {};
Memory.sos.counter = {};
Memory.sos.lock = {};
Memory.sos.monitor = {};
Memory.sos.monitor.priority_tbr = {};
Memory.sos.monitor.priority_ft = {};
Memory.sos.stats = {}
Memory.sos.tickrate = {};

Memory.__notify_history = {};