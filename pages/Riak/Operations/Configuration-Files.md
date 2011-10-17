Riak has two configuration files located in `etc/` if you are using a source
install and in `/etc/riak` if you used a binary install. The files are
`app.config` and `vm.args`.

The `app.config` file is used to set various attributes for the node such as the
backend the node will use to store data. The `vm.args` file is used to pass
parameters to the Erlang node such as the name or cookie of the Erlang node.

<div id="toc"></div>

## app.config

Riak and the Erlang applications it depends on are configured by settings in the
`app.config` file in the `etc` directory of the Riak node.  The format of the
file is similar to Erlang's ".app" files:

```erlang
[
   {riak_core, [
      {ring_state_dir, "data/ring"}
      %% More riak_core settings...
   ]},
   {riak_kv, [
      {storage_backend, riak_kv_bitcask_backend},
      %% More riak_kv settings...
   ]}
   %% Other application configurations...
].
```

### riak_core settings

#### cluster_name

The name of the cluster. This currently has no visible effect, but could be
useful for identifying multiple clusters within your larger infrastructure.

#### default_bucket_props

These are properties used for buckets that have not been explicitly defined (as
outlined in the [[HTTP API]]).They are useful for setting default bucket
behavior such as:
* the number of replicas stored (*"n_val")
* whether or not siblings are allowed (*allow_mult")
* the quorum values for get, put and delete requests (*r, w, dw, rw)
* global pre- and post-commit hooks (*precommit, postcommit*)

```erlang
{default_bucket_props, [{n_val,3},
   {allow_mult,false},
   {last_write_wins,false},
   {precommit, []},
   {postcommit, []},
   {chash_keyfun, {riak_core_util, chash_std_keyfun}},
   {linkfun, {modfun, riak_kv_wm_link_walker, mapreduce_linkfun}}
]}
```

#### gossip_interval

How often nodes in the cluster will share information about their ring state, in
milliseconds. (default: "60000")

#### handoff_concurrency

Number of vnodes, per physical node, allowed to perform handoff at once
(default: "4").

#### handoff_port

TCP port number for the handoff listener (default: "8099")

#### handoff_ip

The IP address the handoff listener will bind to. (default: "0.0.0.0")

#### ring_state_dir

The directory on-disk in which to store the ring state (default: "data/ring")

Riak's ring state is stored on-disk by each node, such that each node may be
restarted at any time (purposely, or via automatic failover) and know what its
place in the cluster was before it terminated, without needing immediate access
to the rest of the cluster.

#### ring_creation_size

The number of partitions to divide the hash space into (default: "64")

By default, each Riak node will own ring_creation_size/(number of nodes in the
cluster) partitions.  It is generally a good idea to specify a
"ring_creation_size" a few times the number of nodes in your cluster (e.g.
specify 64-256 partitions for a 4-node cluster).  This gives you room to expand
the number of nodes in the cluster, without worrying about under-use due to
owning too few partitions. This number should be a power of 2 (64, 128, 256,
etc.).

<div class="note">The "ring_creation_size" should be established before your
cluster is live and running and should not be changed thereafter.</div>

#### target_n_val

The highest _n_val_ that you generally intend to use. This affects how
partitions are distributed amongst the cluster and how preflists are calculated,
helping ensure that data is never stored to the same physical node more than
once. *You will only need to change this setting in rare circumstances.*

Assuming _ring_creation_size_ is a power of 2, the ideal value for this setting
is both

* greater than or equal to the largest _n_val_ of any bucket, and
* an even divisor of the number of partitions in your ring
(_ring_creation_size_).

The default value is _4_. For this to be effective at preventing hotspots, your
cluster size (number of physical nodes) must be equal to or larger than
_target_n_val_.

#### http

A list of ip addresses and ports on which Riak's HTTP interface should listen
(default: {"127.0.0.1", 8091 })

Riak's HTTP interface will not be started if this setting is not defined.

#### https

A list of ip addresses and ports on which Riak's HTTPS interface should listen
(default: not enabled)

Riak's HTTPS interface will not be started if this setting is not defined.

#### ssl

You can override the default SSL key and certificate settings (default:
etc/cert.pem, etc/key.pem)

#### http_logdir

Override the default location of the access logs.  See the
[webmachine_logger_module](#webmachine_logger_module) settings to enable access
logs.

#### disable_http_nagle

When set to `true`, this option will disable the Nagle buffering algorithm for
HTTP traffic.  This is equivalent to setting the `TCP_NODELAY` option on the
HTTP socket. The setting defaults to `false`.  If you experience consistent
minimum latencies in multiples of 20 milliseconds, setting this option to `true`
may reduce latency.

### riak_kv settings

#### add_paths

A list of paths to add to the Erlang code path.

This setting is especially useful for allowing Riak to use external modules
during MapReduce queries.

#### mapred_name

The base of the path in the URL exposing [[MapReduce]] via HTTP. (default:
"mapred")

#### mapred_queue_dir

The directory used to store a transient queue for pending map tasks. Only valid
when `mapred_system` is set to `legacy` (default:
"data/mrqueue")

#### mapred_system

Indicates which version of the MapReduce system should be used: 'pipe' means
riak_pipe will power MapReduce queries, while 'legacy' means that luke will be
used. (default: `pipe`)

#### map_js_vm_count

The number of Javascript VMs started to handle map phases. (default: "8")

#### reduce_js_vm_count

The number of Javascript VMs started to handle reduce phases.  (default: "6")

#### hook_js_vm_count

The number of Javascript VMs started to handle pre-commit hooks.(default: "2")

#### mapper_batch_size

Number of items the mapper will fetch in one request. Larger values can impact
read/write performance for non-MapReduce requests. Only valid when mapred_system
is `legacy` (default: "5")

#### js_max_vm_mem

The maximum amount of memory allocated to each Javascript virtual machine, in
megabytes. (default: "8")

#### js_thread_stack

The maximum amount of thread stack space to allocate to Javascript virtual
machines, in megabytes.  (default: "16")

#### map_cache_size

Number of objects held in the MapReduce cache. These will be ejected when the
cache runs out of room or the bucket/key pair for that entry changes. Only valid
when mapred_system is `legacy`. (default:
"10000")

#### js_source_dir

Where to load user-defined built in Javascript functions (default: unset)

#### http_url_encoding

Determines how Riak treats URL encoded buckets, keys, and links over the REST
API. When set to `on` Riak always decodes encoded values sent as URLs and
Headers. Otherwise, Riak defaults to compatibility mode where links are decoded,
but buckets and keys are not. The compatibility mode will be removed in a future
release. (default: `off`)

#### vnode_vclocks

When set to `true` uses vnode-based vclocks rather than client ids.  This
significantly reduces the number of vclock entries. Only set `true` if *all*
nodes in the cluster are upgraded to 1.0. (default: `false`)

#### legacy_keylisting

This option enables compatability of bucket and key listing with 0.14 and
earlier versions. Once a rolling upgrade to a version >= 1.0 is completed for a
cluster, this should be set to `false` for improved performance for bucket and
key listing operations. (default: `true`)

#### pb_ip

The IP address that the [[Protocol Buffers interface|PBC API]] will bind to.
(default: "127.0.0.1") If not set, the PBC interface will not be started.

#### pb_port

The port that the [[Protocol Buffers interface|PBC API]] will bind to. (default:
8087)

#### pb_backlog

The maximum length to which the queue of pending connections may grow. If set,
it must be an integer >= 0. If you anticipate a huge number of connections being
initialised *simultaneously*, set this number higher. (default: 5)

#### raw_name

The base of the path in the URL exposing Riak's HTTP interface (default: "riak")

The default value will expose data at `/riak/Bucket/Key`.  For example, changing
this
setting to "bar" would expose the interface at `/bar/Bucket/Key`.

#### riak_kv_stat

Enables the statistics-aggregator (/stats URL and _riak-admin status_ command)
if set to *true*. (default is true)

#### stats_urlpath

The base of the path in the URL exposing the statistics-aggregator. (default:
"stats")

#### storage_backend

The module name of the storage backend that Riak should use (default:
"riak_kv_bitcask_backend")

The storage format Riak uses is configurable.  Riak will refuse to start if no
storage backend is specified.

Available backends:

- **riak_kv_bitcask_backend**
  Data is stored in [[Bitcask|https://github.com/basho/bitcask]] append-only
  storage. See the [[Bitcask|Bitcask#Configuring-Bitcask]] configuration page
  for more information.
- **riak_kv_eleveldb_backend**
  Data is stored in [[LevelDB|https://github.com/basho/eleveldb]]. See the
  [[LevelDB|LevelDB#Configuring-eLevelDB]] configuration page for more
  information.
- **riak_kv_innostore_backend**
  Data is stored in [[Innostore|https://github.com/basho/innostore]]. Innostore
  is a seperate install. For more information on installation and configuration,
  read the [[Innostore|Innostore#Configuring-Innostore]] page.
- **riak_kv_memory_backend**
  A backend that behaves as an LRU-with-timed-expiry cache. Read the
  [[Memory|Memory#Configuring-the-Memory-Backend]] backend configuration page
  for more information.
- **riak_kv_multi_backend**
  Enables storing data for different buckets in different backends. See the
  [[Multi|Multi#Configuring-Multiple-Backends]] configuration page for more
  details.

### riak_search

[[Riak Search]] is now enabled via the app.config. To enable it in your app, simply set it to "true" in Riak Search Config section (shown below).

```erlang

%% Riak Search Config
{riak_search, [
               %% To enable Search functionality set this 'true'.
               {enabled, false}
              ]},
```

#### vnode_mr_timeout

How long a map function is permitted to execute on a vnode before it times out
and is retried on another vnode, in milliseconds. (default: "1000")

#### webmachine_logger_module

This needs to be set in order to enable access logs.

```erlang
{webmachine, [{webmachine_logger_module, webmachine_logger}]}
```

<div class="note">The additional disk I/O of an access log imposes a performance
cost you may not wish to pay.  Therefore, by default, Riak does not produce
access logs.</div>

### riak_search settings

#### enabled

Enable Search functionality. (default: `false`)

### lager

[[Lager|https://github.com/basho/lager]] is the logging engine introduced in
Riak 1.0. It is designed to be more stable than Erlang's `error_logger`,
as well as play nicely with standard logging tools.

#### handlers

Allows the selection of log handlers with differing options.

- **lager_console_backend**
Logs to the the console, with the specified log level.
- **lager_file_backend**
Logs to the given list of files, each with their own log level.

#### crash_log

Whether to write a crash log, and where. (default: no crash logger)

#### crash_log_size

Maximum size in bytes of events in the crash log. (default: 65536)

#### error_logger_redirect

Whether to redirect sasl error_logger messages into lager. (default: `true`)

The default lager options are like so:

```erlang
{lager, [
          {handlers, [
            {lager_console_backend, info},
            {lager_file_backend, [
              {"/opt/riak/log/error.log", error},
              {"/opt/riak/log/console.log", info}
            ]}
          ]},.
          {crash_log, "{{platform_log_dir}}/crash.log"},
          {crash_log_size, 65536},
          {error_logger_redirect, true}
        ]},
```

## vm.args

Parameters for the Erlang node on which Riak runs are set in the `vm.args` file
in the `etc` directory of the embedded Erlang node. Most of these settings can
be left at their defaults until you are ready to tune performance.

Two settings you may be interested in right away, though, are "-name" and
"-setcookie".  These control the Erlang node names (possibly host-specific), and
Erlang inter-node communication access (cluster-specific), respectively.

The format of the file is fairly loose: all lines that do not begin with the "#"
character are concatenated, and passed to the "erl" on the command line, as is.

More details about each of these settings can be found in the
[[Erlang|http://www.erlang.org/doc/man/erl.html]] documentation for the "erl"
Erlang virtual machine.

### Erlang Runtime Configuration Options

#### -name

the name of the Erlang node (default: "riak@127.0.0.1")

The default value, `riak@127.0.0.1` will work for running Riak locally, but for
distributed (multi-node) use, the value after the "`" should be changed to the
IP address of the machine on which the node is running.

If you have properly-configured DNS, the short-form of this name can be used
(for example: "riak").  The name of the node will then be "riak@Host.Domain".

#### -setcookie

the cookie of the Erlang node (default: "riak")

Erlang nodes grant or deny access based on the sharing of a previously-shared
cookie.  You should use the same cookie for every node in your Riak cluster, but
it should be a not-easily-guessed string unique to your deployment, to prevent
non-authorized access.

#### -heart

enable "heart" node monitoring (default: disabled)

Heart will restart nodes automatically, should they crash.  However, heart is so
good at restarting nodes that it can be difficult to prevent it from doing so.
Enable heart once you are sure that you wish to have the node restarted
automatically on failure.

#### +K

enable kernel polling (default: "true")

#### +A

number of threads in the async thread pool (default: 64)

#### -env

set host environment variables for Erlang

#### -smp

Enables Erlang's SMP support. *This is necessary for the innostore backend to
work, even on single-processor systems.* (default: "enable")

## Rebar Overlays

If you are going to be rebuilding Riak often, you will want to edit the
`vm.args` and `app.config` files in the `rel/files` directory. These files are
used whenever a new release is generated using "make rel" or "rebar generate".
Each time a release is generated any existing release must first be destroyed.
Changes made to release files (`rel/riak/etc/vm.args`,
`rel/riak/etc/app.config`, etc.) would be lost when the release is destroyed.
