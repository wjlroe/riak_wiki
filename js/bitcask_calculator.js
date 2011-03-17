$(document).ready(function(){
  if($('#key_size').length == 0){
    return
  }else{
    
    node_calculator = new NodeCalculator()
    node_calculator.update_nodes()
    
    bitcask_calculator = new BitcaskCalculator()
    bitcask_calculator.update_overhead()
    bitcask_calculator.update_capacity()
     
  }
  
  //nodes handlers
  $('#n_total_keys').change(function () {    
    node_calculator.update_nodes()
  });
  $('#n_key_size').change(function () {    
    node_calculator.update_nodes()
  });
  $('#n_record_size').change(function () {    
    node_calculator.update_nodes()
  });
  $('#n_ram').change(function () {    
    node_calculator.update_nodes()
  });
  
  $('#nval').change(function () {    
    node_calculator.update_nodes()
  })
  
  $('#total').change(function () {    
    node_calculator.update_nodes()
  })
  

  
  //bitcask handlers
  $('#key_size').change(function () {    
    bitcask_calculator.update_overhead()
  });
  $('#nodes').change(function () {
    bitcask_calculator.update_capacity()
  });
  $('#value_size').change(function () {
    bitcask_calculator.update_capacity()
  });
  $('#ram').change(function () {
    bitcask_calculator.update_capacity()
  });
  
  $('#key_size').focusin(function () {    
    $('#entry_info').text("This is the approximate size of your keys, measured in bytes. Why does this matter? In addition to the standard 40 byte per key overhead that Bitcask requires, you need to factor in the key's actual size that will be unique to your application and use case.")
  });
  
  $('#value_size').focusout(function () {    
    $('#entry_info').text("")
    
  });
  $('#value_size').focusin(function () {    
    $('#entry_info').text("This is how large you expect your values to be. We use this variable to calculate how much disk space you'll need in your cluster. ")
  });
  
  $('#key_size').focusout(function () {    
    $('#entry_info').text("")
    
  });
  
})


function NodeCalculator(){
  

  this.total_keys = function () {
    return parseFloat($('#n_total_keys').val())
  }
  
  this.record_size = function () {
    return parseFloat($('#n_record_size').val())
  }
  
  this.key_size = function () {
    var key_size = parseFloat($('#n_key_size').val())
    return key_size + 40
  }

  this.nval = function () {
    return parseFloat($('#nval').val())
  }
  
  
  this.ram = function (){
    return parseFloat($('#n_ram').val()) * 1073741824
  }

  
  this.nodes = function () {  
    var nnodes = ((this.key_size() * this.total_keys())*this.nval())/this.ram()
    if(nnodes < 1) {
      nnodes = 3
    }
    return nnodes.toFixed()
  }
  
  
  this.update_nodes = function () {
    var disk = (((this.record_size() * this.total_keys())/1073741824)/this.nodes()).toFixed()
    if(disk < 1){
      disk = "Less than 1"
    }
    $('#node_count').text(this.nodes()+" ("+disk+" GB Storage per Node)")

  }
  
  
}


function BitcaskCalculator(){
  
  this.key_overhead = function () {
    var key_size = parseFloat($('#key_size').val())
    return key_size + 40
  }
  this.value_size = function () {
    return parseFloat($('#value_size').val())
  }
  this.nval = function () {
    return parseFloat($('#nval').val())
  }
  
  
  this.total_ram = function (){
    var ram = parseFloat($('#ram').val()) * 1073741824
    return ram * parseFloat($('#nodes').val())
  }
  this.total_doc_raw = function () {
    return total_doc_count = this.total_ram()/this.key_overhead()
    
    
  }
  this.total_docs = function () {
    return this.total_doc_raw().toFixed().toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    
  }
  

  this.disk_space = function () {
    var disk_space_raw = ((this.total_ram()/this.key_overhead())*this.value_size())/1073741824
    return disk_space_raw.toFixed().toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
  }
  
  this.update_overhead = function () {
    $('#key_overhead').text(this.key_overhead() + " Bytes (40 Byte Overhead)")
  }
  
  this.update_capacity = function () {
    $('#total_documents').text(this.total_docs())
    $('#total_disk_space').text(this.disk_space() + " GB of Disk Space")
  }
  
  

  
  
}