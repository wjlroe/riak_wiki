$(document).ready(function(){
  $('#key_size').change(function () {
      calculate_overhead()
  });
  $('#nodes').change(function () {
      document_capacity()
  });
  
})


function get_values(){
  key_size = parseFloat($('#key_size').val())
  key_overhead = key_size + 40
  value_size = parseFloat($('#value_size').val())
  ram = parseFloat($('#ram').val()) * 1073741824	
  nodes = parseFloat($('#nodes').val())
  total_ram = ram * nodes
  total_docs = total_ram/key_overhead
}

function calculate_overhead(){
  get_values()  
  $('#key_overhead').text(key_overhead + "Bytes (40 Byte Overhead)")
}

function document_capacity(){
  get_values()
  $('#total_documents').text(total_docs)
  
}