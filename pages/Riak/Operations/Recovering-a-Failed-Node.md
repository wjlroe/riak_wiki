Restarting a node after a failure may result in a slower than normal
startup time. For example, an InnoDB backed node may need to perform a
crash recovery on startup. The longer startup time associated with
recovery may lead to other problems;
[[bug #134|https://issues.basho.com/show_bug.cgi?id=134]], for
example, describes an issue where Riak may begin sending requests
(get, put, delete) to nodes before they are ready to accept
requests. To avoid problems when recovering a failed node the
following technique should be followed.

<div class="info"><div class="title">Bug 134 - Node liveness</div>
[[The node liveness issue related to crash recovery|https://issues.basho.com/show_bug.cgi?id=134]]
has been fixed in Riak 0.12.</div>

## General Recovery Notes

When a Riak node is to be recovered, general rules of recovery apply
depending on what failed in particular. Check for RAID and file system
consistency, faulty memory, fully functional network connections, etc.

In general, when a failed node comes back up, make sure it has the
same node name as before it crashed.  Changing the node name makes the
cluster assume this is an entirely new node, leaving the old one still
as part of the ring, until you remove it manually using `riak-admin
remove riak@node-name.host`.

When the node is recovering, hinted handoff will kick in and update
the data on the recovered node with updates from the rest of the
cluster. Your cluster may temporarily return "not found" for objects
that are currently being handed off (see our page on
[[Eventual Consistency]] for more details on these scenarios, in
particular how the system behaves while the failed node is not part of
the cluster).

There may be additional steps for recovery that depend on your storage
backend.

## Bitcask

A failed node that's using Bitcask as storage backend can be started
normally using `riak start` or the Riak init.d scripts and should
recover on its own.

## Innostore

A failed node that's using the Innostore storage backend can be
re-introduced by starting the node in isolation, allowing it to
stabilize, cleanly stopping it, and restarting it within the cluster.

### 1. Temporarily set a different Erlang cookie

In etc/vm.args or /etc/riak/vm.args, depending on your system and Riak
installation type, comment out the following line with a %.

```bash
-setcookie riak
```

It should look like this after being commented out:

```bash
% -setcookie riak
```

Add a new line that uses a different cookie name, e.g. nocookie.

```bash
-setcookie nocookie
```

### 2. Bring up the riak node on the console.

```bash
./bin/riak console
```

### 3. Allow InnoDB to recover

```bash
InnoDB will output messages to the console during recovery. An example recovery
session may look as follows:
InnoDB: Mutexes and rw_locks use GCC atomic builtins
100610 12:09:58  InnoDB: highest supported file format is Barracuda.
InnoDB: Log scan progressed past the checkpoint lsn 205513
100610 12:09:58 InnoDB: Database was not shut down normally!
InnoDB: Starting crash recovery.
InnoDB: Reading tablespace information from the .ibd files...
InnoDB: Restoring possible half-written data pages from the doublewrite
InnoDB: buffer...
InnoDB: Doing recovery: scanned up to log sequence number 1836519
100610 12:09:58 InnoDB: Starting an apply batch of log records to the
database...
InnoDB: Progress in percents: 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53
54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79
80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 Eshell V5.7.5
(abort with ^G)
1>
InnoDB: Apply batch completed
100610 12:09:59 Embedded InnoDB 1.0.6.6750 started; log sequence number 1836519
```

### 4. Exit the console

```bash
2> q().
```

### 5. Remove the line you added in step 1, and restore the original line so that it once again looks like this:

```bash
-setcookie riak
```

### 6. Start the node (the node will start normally and re-join the cluster)

```bash
./bin/riak start
```
