$(document).ready(function(){
  if($('#key_size').length == 0){
    return
  }else{
    calculator = new Calculator();
    calculator.update_overhead()
    calculator.update_capacity()
    calculator.update_millions()
     
  }

  $('#key_size').change(function () {    
      calculator.update_overhead()
      calculator.update_millions()
  });
  $('#nodes').change(function () {
    calculator.update_capacity()
  });
  $('#value_size').change(function () {
    calculator.update_capacity()
  });
  $('#ram').change(function () {
    calculator.update_capacity()
    calculator.update_millions()
  });
  $('#nval').change(function () {
    calculator.update_capacity()
    calculator.update_millions()
  });
  
  
  $('#key_size').focusin(function () {  
     $('#entry_info').text = "Estimate Average Key Size:  This is the approximate size of your keys, measured in bytes. Why does this matter? In addition to the standard 40 byte per key overhead that Bitcask requires, you need to factor in the key's actual size that will be unique to your application and use case."
   });
   $('#key_size').focusout(function () {    
     $('#entry_info').text = ""
   });

})




function Calculator(){
  
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
  
  this.get_millions = function () {
    var millions = (this.nval() * 10000000)/this.total_doc_raw()
    console.log(millions)
    return millions.toFixed().toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
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
    $('#total_disk_space').text(this.disk_space() + " Gigabytes of Disk Space")
  }
  
  this.update_millions = function () {
    $('#millions').text(this.get_millions())
  }
  
  

  
  
}