var lazyLoadInstance = new LazyLoad({
});


$(document).one("scroll", function () {
  const s = $(document).scrollTop();
  if (s > 100) {
    $(".lazy-img").attr("src", function () {
      return $(this).attr("data-img");
    });
    $(".lazy-bg").attr("style", function () {
      return $(this).attr("data-bg");
    });
  }
});

$(document).on("touchstart", function () {
  $(".lazy-img").attr("src", function () {
    return $(this).attr("data-img");
  });
  $(".lazy-bg").attr("style", function () {
    return $(this).attr("data-bg");
  });
});

$(document).on("mouseover", function () {
  $(".lazy-img").attr("src", function () {
    return $(this).attr("data-img");
  });
  $(".lazy-bg").attr("style", function () {
    return $(this).attr("data-bg");
  });
});

$(document).scroll(function () {
  const s = $(document).scrollTop();
  // console.log(s);
  if (s > 200) {
    $(".header").addClass("affix");
  } else {
    $(".header").removeClass("affix");
  }
});

$(document).scroll(function () {
  const s = $(document).scrollTop();
  if (s > 200) {
    $(".social-icon").addClass("active");
  } else {
    $(".social-icon").removeClass("active");
  }
});

$(".up-to-top").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 1000);
});

$(document).ready(function () {
    $(".owl-prev").attr("aria-label", "Previous slide");
    $(".owl-next").attr("aria-label", "Next slide");
    $(".owl-dot").attr("aria-label", "dots");
});

$(".close_menu").click(function () {
  $(".menu-mobile").removeClass("active");
  $(".backdrop").removeClass("active");
});

$(".backdrop").click(function () {
  $(".backdrop").removeClass("active");
  $(".sidebar-product").removeClass("active");
  $(".menu-mobile").removeClass("active");
});

$(".control_sidebar").click(function() {
    $(".sidebar-product").addClass("active");
  $(".backdrop").addClass("active");
})

$(".sidebar_close").click(function() {
    $(".sidebar-product").removeClass("active");
  $(".backdrop").removeClass("active");
})

$(".btn_menu").click(function () {
  $(".menu-mobile").addClass("active");
  $(".backdrop").addClass("active");
});

$(".btn_readmore").click((e) => {
    $(".product_content").toggleClass('active');
    if($(e.currentTarget).text() == 'Xem thêm') {
        $(e.currentTarget).text('Rút gọn');
    } else {
        $(e.currentTarget).text('Xem thêm');
    }
})

$(".form_search").click(() => {
    $(".search_box").toggleClass('active');
})

$('.slider-owl').owlCarousel({
    loop:true,
    margin:10,
    nav:false,
    dots: true,
    items:1
});

$('.home-img-owl').owlCarousel({
    loop:true,
    margin:10,
    nav:false,
    dots: true,
    items:1
});

$('.home-product-owl').owlCarousel({
    loop:true,
    nav:true,
    dots: false,
    navText: [
        `<svg width="22" height="45">
            <use href="#icon-prev-owl"></use>
            </svg>`,
        `<svg width="22" height="45">
            <use href="#icon-next-owl"></use>
        </svg>`
    ],
    responsive:{
        0:{
            items: 2,
            margin:16,
        },
        768:{
            items:4.5,
            margin:40,
        },
    }
})

$('.home-product-seen-owl').owlCarousel({
    loop:true,
    nav:true,
    dots: false,
    navText: [
        `<svg width="22" height="45">
            <use href="#icon-prev-owl"></use>
            </svg>`,
        `<svg width="22" height="45">
            <use href="#icon-next-owl"></use>
        </svg>`
    ],
    responsive:{
        0:{
            items: 2,
            margin:16,
        },
        768:{
            items:4.5,
            margin:40,
        },
    }
})

$('.home-product-owl-2').owlCarousel({
    loop:true,
    
    nav:true,
    dots: false,
    navText: [
        `<svg width="22" height="45">
            <use href="#icon-prev-owl"></use>
            </svg>`,
        `<svg width="22" height="45">
            <use href="#icon-next-owl"></use>
        </svg>`
    ],
    responsive:{
        0:{
            items: 2,
            margin:16,
        },
        768:{
            items:4.5,
            margin:30,
        },
        1201:{
            items:5.5,
            margin:30,
        },
    }
})

$('.home-banner-owl').owlCarousel({
    loop:true,
    margin:0,
    nav:false,
    dots: true,
    autoplay:true,
    autoplayTimeout:5000,
    items:1
})

$('.hang-owl').owlCarousel({
    loop:false,
    margin:10,
    nav:false,
    dots: false,
    autoplay:true,
    autoplayTimeout:5000,
    responsive:{
        0:{
            items: 3,
        },
        768:{
            items: 4,
        },
    }
})

$('.home-video-owl').owlCarousel({
    loop:true,
    margin:20,
    nav:true,
    navText: [
        `<svg width="22" height="45">
            <use href="#icon-prev-owl"></use>
            </svg>`,
        `<svg width="22" height="45">
            <use href="#icon-next-owl"></use>
        </svg>`
    ],
    dots: false,
    responsive:{
        0:{
            items: 2,
        },
        768:{
            items: 4,
        },
        1200:{
            items: 8,
        },
    }
})

$('.home-news-owl').owlCarousel({
    loop:true,
    margin:30,
    nav:true,
    navText: [
        `<svg width="22" height="45">
            <use href="#icon-prev-owl"></use>
            </svg>`,
        `<svg width="22" height="45">
            <use href="#icon-next-owl"></use>
        </svg>`
    ],
    dots: false,
    responsive:{
        0:{
            items: 1,
        },
        768:{
            items: 4,
        },
    }
})

$(".home_video").click(function () {
  var src = $(this).attr("data-src");
  openvideo(src);
});

function openvideo(src) {
  var ytm =
    '<iframe width="100%" height="500" src="' +
    src +
    '"></iframe>';
  $(".video-box").html(ytm);
  $("#video-modal").modal("show");
}

$("#video-modal").on("hidden.bs.modal", function () {
  $(".video-box").html("");
});

// ----- Validate -----
function validatePhone(phone) {
  var re = /((09|03|07|08|05)+([0-9]{8})\b)/g;
  // console.log(phone);
  if (phone == "") {
    Swal.fire({
      icon: "warning",
      // title: 'Vui lòng nhập số điện thoại!',
      text: "Vui lòng nhập số điện thoại!",
      confirmButtonColor: "#ed6522",
    });

    return false;
  }

  if (re.test(phone) == false || phone.length != 10) {
    Swal.fire({
      icon: "warning",
      // title: 'Vui lòng nhập số điện thoại!',
      text: "Số điện thoại của bạn sai định dạng!",
      confirmButtonColor: "#ed6522",
    });

    return false;
  }

  return true;
}
function validateEmail(email) {
  var re = /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
  if (email == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập Email!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }

  if (re.test(email) == false) {
    Swal.fire({
      icon: "warning",
      text: "Email của bạn sai định dạng!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }

  return true;
}

function validateWebsite(url) {
  var urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
  if (url == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập website!",
      confirmButtonColor: "#ed6522",
    });

    return false;
  }
  if (urlPattern.test(url) == false) {
    Swal.fire({
      icon: "warning",
      text: "Website không đúng định dạng!",
      confirmButtonColor: "#ed6522",
    });

    return false;
  }
  return true;
}
// ----- End Validate -----

window.onload = function () {
  var sliderSections = document.getElementsByClassName("range-slider");

  for (var x = 0; x < sliderSections.length; x++) {
    var sliders = sliderSections[x].getElementsByTagName("input");

    for (var y = 0; y < sliders.length; y++) {
      if (sliders[y].type === "range") {
        sliders[y].addEventListener("input", getVals);
        sliders[y].addEventListener("change", updateURL);
        getVals.call(sliders[y]);
      }
    }
  }
};

function getVals() {
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");

  var slide1 = parseFloat(slides[0].value);
  var slide2 = parseFloat(slides[1].value);

  if (slide1 > slide2) {
    var tmp = slide2;
    slide2 = slide1;
    slide1 = tmp;
  }

  var displayElement = parent.getElementsByClassName("rangeValues")[0];
  displayElement.innerHTML =
    slide1.toLocaleString() + "đ - " + slide2.toLocaleString() + "đ";
}

function updateURL() {
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");

  var slide1 = parseFloat(slides[0].value);
  var slide2 = parseFloat(slides[1].value);

  if (slide1 > slide2) {
    var tmp = slide2;
    slide2 = slide1;
    slide1 = tmp;
  }

  var searchParams = new URLSearchParams(window.location.search);
  var url = new URL(window.location.href);

  if (searchParams.get("min") !== null && searchParams.get("max") !== null) {
    url.searchParams.set("min", slide1);
    url.searchParams.set("max", slide2);
    window.location.href = url.href;
  } else {
    window.location.href = action_sort + "&min=" + slide1 + "&max=" + slide2;
  }
}

const sliderProduct = $(".product-img-owl");
const dotsProduct = $(".product-dots-owl");

sliderProduct.owlCarousel({
  loop: false,
  margin: 10,
  nav: true,
  navText: [
    `<svg width="22" height="45">
        <use href="#icon-prev-owl"></use>
        </svg>`,
    `<svg width="22" height="45">
        <use href="#icon-next-owl"></use>
    </svg>`
    ],
  dots: false,
  items: 1,
});

dotsProduct.owlCarousel({
  loop: false,
  margin: 0,
  nav: false,
  dots: false,
  items: 4,
});

const dotsImage = $(".img-dots");
dotsImage.click(function () {
  var index = $(this).index();
  sliderProduct.trigger("to.owl.carousel", [index, 500, true]);
  dotsImage.removeClass("focus");
  $(this).addClass("focus");
});

sliderProduct.on("changed.owl.carousel", function (e) {
  console.log(e.item.index);
  dotsProduct.trigger("to.owl.carousel", [e.item.index, 500, true]);
  $(".product-dots-owl .owl-item").removeClass("focus");
  $(".product-dots-owl .owl-item").eq(e.item.index).addClass("focus");

  dotsImage.removeClass("focus");
  dotsImage.eq(e.item.index).addClass("focus");
});

dotsProduct.on("click", ".owl-item", function (e) {
  console.log($(this));
  sliderProduct.trigger("to.owl.carousel", [$(this).index(), 500, true]);
  $(".product-dots-owl .owl-item").removeClass("focus");
  $(this).addClass("focus");
});

Fancybox.bind("[data-fancybox]", {
  compact: false,
  contentClick: "iterateZoom",
  Images: {
    Panzoom: {
      maxScale: 2,
    },
  },
});

$(".btn_capacity").click((e) => {
  $('.btn-capacity').removeClass('active');
  $(e.currentTarget).addClass('active');

  const price = $(e.currentTarget).attr('data-price');
  const price_vip = $(e.currentTarget).attr('data-price-vip');
  const price_gold = $(e.currentTarget).attr('data-price-gold');
  const price_member = $(e.currentTarget).attr('data-price-member');

  $(".capacity-price").addClass('active');

  $(".capacity_price").text(Number(price).toLocaleString("en-US") + ' VND');

  $(".price_vip").text(Number(price_vip).toLocaleString("en-US"));
  $(".price_gold").text(Number(price_gold).toLocaleString("en-US"));
  $(".price_member").text(Number(price_member).toLocaleString("en-US"));

  if(level == 'vip') {
    $(".product_price").val(price_vip);
  }

  if(level == 'gold') {
    $(".product_price").val(price_gold);
  }

  if(level == 'member') {
    $(".product_price").val(price_member);
  }
  
  if(level == '') {
    $(".product_price").val(price);
  }
})

//-----Cart-----
function need_login() {
  Swal.fire({
    text: "Bạn cần đăng nhập để sử dụng tính năng này! 😘",
    icon: "warning",
    confirmButtonText: "Đăng nhập ngay bây giờ",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = DOMAIN + "login";
    }
  });
}


// Add cart
var link_add = DOMAIN + "cart/add/";

function add_cart(node_id) {
  var quantity = $(".input-qty").val();
  const price = $(".product_price").val();

  var activeSize = $(".btn-capacity.active").attr("data-id");
  var titleSize = $(".btn-capacity.active").text();
  var link_add_cart = "";

  // if (!(!isNaN(parseFloat(price)) && isFinite(price))) {
  //   Swal.fire({
  //     title: "Có lỗi xảy ra!",
  //     text: "Vui lòng liên hệ quản trị viên để biết thêm thông tin về giá !",
  //     icon: "warning",
  //     showCancelButton: false,
  //     confirmButtonColor: "#ff6109",
  //     cancelButtonColor: "#f46a6a",
  //   });
  //   return false;
  // }

  if (typeof activeSize !== "undefined") {
    link_add_cart = "Dung tích: " + titleSize;
  }

  var link_cart =
    link_add +
    node_id +
    "?price=" +
    price +
    "&quantity=" +
    quantity +
    "&size=" +
    activeSize +
    "&d=" + link_add_cart;

  Swal.fire({
    title: "Thành công",
    text: "Thêm vào giỏ hàng thành công",
    icon: "success",
    showCancelButton: false,
    confirmButtonColor: "#ff6109",
    cancelButtonColor: "#f46a6a",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = link_cart;
    }
  });
}

function add_combo_cart(node_id, price) {
  var link_add_cart = DOMAIN + "cart/add/" + node_id + "?ajax=1&&price=" + price; 

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: link_add_cart,
    cache: false,
    dataType: "json",
    success: function (data) {
      console.log("done");
      Swal.fire({
        title: "Thành công",
        text: "Thêm vào giỏ hàng thành công",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#ff6109",
        cancelButtonColor: "#f46a6a",
      }).then((result) => {
        if (result.isConfirmed) {
          // Reload the page
          window.location.reload();
        }
      });
    },
    error: function (err) {
      console.log(err);
      
      console.log("error");
    },
  });
  return false;
}

function add_cart_list(node_id) {
  const price = $(".product_price").val();
  
  var link_add_cart = DOMAIN + "cart/add/" + node_id + "?ajax=1&price=" + price; 
  
  var activeSize = $(".btn-capacity.active").attr("data-id");
  var titleSize = $(".btn-capacity.active").text();
  if (typeof activeSize !== "undefined") {
    link_add_cart = link_add_cart + "&size=" + activeSize + '&d=' + 'Dung tích: '+ titleSize;
  }

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: link_add_cart,
    cache: false,
    dataType: "json",
    success: function (data) {
      console.log("done");
      Swal.fire({
        title: "Thành công",
        text: "Thêm vào giỏ hàng thành công",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#ff6109",
        cancelButtonColor: "#f46a6a",
      }).then((result) => {
        if (result.isConfirmed) {
          // Reload the page
          window.location.reload();
        }
      });
    },
    error: function (err) {
      console.log(err);
      
      console.log("error");
    },
  });
  return false;
}
// End add cart

//  Cart update
var is_sending = false;

function update_cart() {
  if (is_sending == true) return;

  var str = "";
  var total = 0;

  $(".tr_id").each(function () {
    var id = $(this).attr("rel");
    var v = $(".tr_id_" + id).val();
    str = str + id + "." + v + ";";

    var price = $(this).find(".price").attr("data-price");
    price = parseInt(price);

    total = total + price * v;
    $(this)
      .find(`.cart - total - ${id} `)
      .html(price * v)
      .number(true, 0);
  });

  // console.log("ss", total);

  $(".cost #total-cart-price").text(total).number(true, 0);

  var uri = DOMAIN + "cart/update/?data=" + str + "&ajx=1";
  is_sending = true;

  $.ajax({
    url: uri,
    type: "get",
    dataType: "html",
    success: function (d) {
      console.log(d);
      is_sending = false;
    },
    error: function (err) {
      console.log(err);
      is_sending = false;
    },
  });

  is_sending = false;
}
// End cart update

// Cart confirm

$(".cart-submit").submit(function () {
  var email = $('.cart-submit input[name="email"]').val();
  var phone = $('.cart-submit input[name="phone"]').val();
  var address = $('.cart-submit input[name="address"]').val();

  if (email == "") {
    Swal.fire({
      title: "Xin vui lòng nhập email!",
      icon: "warning",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }

  if (phone == "") {
    Swal.fire({
      title: "Xin vui lòng nhập điện thoại!",
      icon: "warning",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }

  if (validateEmail(email) == false) {
    Swal.fire({
      title: "Nhập sai định dạng email!",
      icon: "warning",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }
  if (validatePhone(phone) == false) {
    Swal.fire({
      title: "Nhập sai định dạng điện thoại!",
      icon: "warning",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }

  if (address == "") {
    Swal.fire({
      title: "Xin vui lòng nhập địa chỉ!",
      icon: "warning",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }

  return true;
});

$(".input-qty").on("change", function () {
  var input = $(this);
  if (isNaN(input.val()) || input.val() == "" || input.val() < 1) {
    input.val(1);
  } else {
    input.val(parseInt(input.val()));
  }
  update_cart();
});

$(".input-qty").on("focus", function () {
  var input = $(this);
  oldInput = input.val();
  console.log("oldInput");
  console.log(oldInput);
  $(".input-qty").on("change", function () {
    if (isNaN(input.val()) || input.val() == "" || input.val() < 1) {
      input.val(1);
    } else {
      input.val(parseInt(input.val()));
    }

    if (is_sending == true) return;
    var str = "";
    $(".tr_id").each(function () {
      var id = $(this).attr("rel");
      var v = $(".tr_id_" + id).val();
      str = str + id + "." + v + ";";
    });
    var uri = DOMAIN + "cart/update/?data=" + str + "&ajx=1";
    is_sending = true;
    $.ajax({
      url: uri,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      type: "get",
      dataType: "html",
      success: function (d) {
        // console.log(d);
        $(".tr_id").each(function () {
          var id = $(this).attr("rel");
          var price = parseInt(
            $(".price_tr_id_" + id)
              .text()
              .trim()
              .replace(/,/g, "")
          );
          var qty = parseInt($(".qty.tr_id_" + id).val());
          $(".total_price_tr_id_" + id).text(
            (price * qty).toLocaleString("en-US")
          );
        });

        var cart_price = parseInt(
          $("#total-cart-price").text().trim().replace(/,/g, "")
        );
        var discount_price = $('input[name="coupon_discount"]').val();
        discount_percent = (discount_price * 100) / cart_price;
        discount_percent = Math.round(discount_percent);

        var total_price = 0;
        $(".total-price").each(function () {
          var price = parseInt($(this).text().trim().replace(/,/g, ""));
          total_price = total_price + price;
        });

        var check_for_sum = $('input[name="for_sum"]').val();

        if (check_for_sum > total_price) {
          Swal.fire({
            title: "Thông báo!",
            text: "Tổng đơn hàng không được nhỏ hơn giá áp dụng của mã giảm giá !",
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#556ee6",
            cancelButtonColor: "#f46a6a",
          });
          input.val(oldInput);
          input.trigger("change");
          is_sending = false;
          return;
        }

        var discount = 0;
        if (discount_percent > 0) {
          discount = (total_price * discount_percent) / 100;
          $('input[name="coupon_discount"]').val(discount);
          $("#discount_price").text(discount.toLocaleString("en-US"));
        }
        $(".cart-sum").val(total_price);
        $(".price-tong-cong").text(total_price.toLocaleString("en-US"));
        $(".price-thanh-toan").text(
          (total_price - discount).toLocaleString("en-US")
        );
        $(".thanh-toan").val(total_price - discount);
        is_sending = false;
      },
      error: function (err) {
        console.log(err);
        is_sending = false;
      },
    });
    is_sending = false;
  });
});

jQuery(".quantity").each(function () {
  var spinner = jQuery(this),
    input = spinner.find("input.qty"),
    btnUp = spinner.find(".quantity-up"),
    btnDown = spinner.find(".quantity-down"),
    min = input.attr("min"),
    max = input.attr("max");
  btnUp.click(function () {
    var oldValue = parseInt(input.val());
    if (oldValue >= max) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue + 1;
    }
    // console.log('NewVal = ', newVal);
    spinner.find("input").val(newVal);
    spinner.find("input").trigger("change");

    if (is_sending == true) return;
    var str = "";
    var total = 0;

    $(".tr_id").each(function () {
      var id = $(this).attr("rel");
      var v = $(".tr_id_" + id).val();
      str = str + id + "." + v + ";";

      var price = $(this).find(".price").attr("data-price");
      price = parseInt(price);

      total = total + price * v;
      // console.log('xxx', price);

      $(this)
        .find(`.cart-total-${id}`)
        .html(price * v)
        .number(true, 0);
    });

    var uri = DOMAIN + "cart/update/?data=" + str + "&ajx=1";
    is_sending = true;
    $.ajax({
      url: uri,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      type: "get",
      dataType: "html",
      success: function (d) {
        // console.log(d);
        $(".tr_id").each(function () {
          var id = $(this).attr("rel");
          var price = parseInt(
            $(".price_tr_id_" + id)
              .text()
              .trim()
              .replace(/,/g, "")
          );
          var qty = parseInt($(".qty.tr_id_" + id).val());
          $(".total_price_tr_id_" + id).text(
            (price * qty).toLocaleString("en-US")
          );
        });

        var cart_price = parseInt(
          $("#total-cart-price").text().trim().replace(/,/g, "")
        );
        var discount_price = $('input[name="coupon_discount"]').val();
        discount_percent = (discount_price * 100) / cart_price;
        discount_percent = Math.round(discount_percent);

        var total_price = 0;
        $(".total-price").each(function () {
          var price = parseInt($(this).text().trim().replace(/,/g, ""));
          total_price = total_price + price;
        });

        var check_for_sum = $('input[name="for_sum"]').val();

        if (check_for_sum > total_price) {
          Swal.fire({
            title: "Thông báo!",
            text: "Tổng đơn hàng không được nhỏ hơn giá áp dụng của mã giảm giá !",
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#556ee6",
            cancelButtonColor: "#f46a6a",
          });
          spinner.find("input").val(oldValue);
          spinner.find("input").trigger("change");
          is_sending = false;
          return;
        }

        var discount = 0;
        if (discount_percent > 0) {
          discount = (total_price * discount_percent) / 100;
          $('input[name="coupon_discount"]').val(discount);
          $("#discount_price").text(discount.toLocaleString("en-US"));
        }
        $(".cart-sum").val(total_price);
        $(".price-tong-cong").text(total_price.toLocaleString("en-US"));
        $(".price-thanh-toan").text(
          (total_price - discount).toLocaleString("en-US")
        );
        $(".thanh-toan").val(total_price - discount);
        is_sending = false;
      },
      error: function (err) {
        console.log(err);
        is_sending = false;
      },
    });
    is_sending = false;
  });

  btnDown.click(function () {
    var oldValue = parseInt(input.val());
    if (oldValue <= min) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue - 1;
    }
    spinner.find("input").val(newVal);
    spinner.find("input").trigger("change");
    if (is_sending == true) return;
    var str = "";
    var total = "";

    $(".tr_id").each(function () {
      var id = $(this).attr("rel");
      var v = $(".tr_id_" + id).val();
      str = str + id + "." + v + ";";

      var price = $(this).find(".price").attr("data-price");
      price = parseInt(price);

      total = total + price * v;
      $(this)
        .find(`.cart-total-${id}`)
        .html(price * v)
        .number(true, 0);
    });

    var uri = DOMAIN + "cart/update/?data=" + str + "&ajx=1";
    is_sending = true;
    $.ajax({
      url: uri,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      type: "get",
      dataType: "html",
      success: function (d) {
        // console.log(d);
        $(".tr_id").each(function () {
          var id = $(this).attr("rel");
          var price = parseInt(
            $(".price_tr_id_" + id)
              .text()
              .trim()
              .replace(/,/g, "")
          );
          var qty = parseInt($(".qty.tr_id_" + id).val());
          $(".total_price_tr_id_" + id).text(
            (price * qty).toLocaleString("en-US")
          );
        });

        var cart_price = parseInt(
          $("#total-cart-price").text().trim().replace(/,/g, "")
        );
        var discount_price = $('input[name="coupon_discount"]').val();
        discount_percent = (discount_price * 100) / cart_price;
        discount_percent = Math.round(discount_percent);

        var total_price = 0;
        $(".total-price").each(function () {
          var price = parseInt($(this).text().trim().replace(/,/g, ""));
          total_price = total_price + price;
        });

        var check_for_sum = $('input[name="for_sum"]').val();

        if (check_for_sum > total_price) {
          Swal.fire({
            title: "Thông báo!",
            text: "Tổng đơn hàng không được nhỏ hơn giá áp dụng của mã giảm giá !",
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#556ee6",
            cancelButtonColor: "#f46a6a",
          });
          spinner.find("input").val(oldValue);
          spinner.find("input").trigger("change");
          is_sending = false;
          return;
        }

        var discount = 0;
        if (discount_percent > 0) {
          discount = (total_price * discount_percent) / 100;
          $('input[name="coupon_discount"]').val(discount);
          $("#discount_price").text(discount.toLocaleString("en-US"));
        }
        $(".cart-sum").val(total_price);
        $(".price-tong-cong").text(total_price.toLocaleString("en-US"));
        $(".price-thanh-toan").text(
          (total_price - discount).toLocaleString("en-US")
        );
        $(".thanh-toan").val(total_price - discount);
        is_sending = false;
      },
      error: function (err) {
        console.log(err);
        is_sending = false;
      },
    });
    is_sending = false;
  });
});
// End cart confirm

//-----Cart-----

//-----COMMENT-----
var is_sending = false;
var onStarx;

$(".starscmt li").on("click", function () {
  var onStar = parseInt($(this).data("value"), 6);
  onStarx = onStar;
  var starses = $(this).parent().children("li.star");
  for (i = 0; i < starses.length; i++) {
    $(starses[i].childNodes[1]).find("use").attr("xlink:href", "#star-green");
  }
  for (i = 0; i < onStar; i++) {
    $(starses[i].childNodes[1]).find("use").attr("xlink:href", "#star-yellow");
  }
  console.log("onStar in click event: cc " + starses.length);
});

function submit_form_comments(node_id, type) {
  console.log("xin chao type", node_id, type);
  if (is_sending == true) {
    return false;
  }
  var fullname = $(".comment__form input[name=fullname]").val();
  var phone = $(".comment__form input[name=phone]").val();
  var email = $(".comment__form input[name=email]").val();
  var website = $(".comment__form input[name=website]").val();
  var content = $(".comment__form textarea").val();
  console.log("onStar in click event: " + onStarx);
  $('input[name="content"]').val(content);
  var d;
  if (type == "news") {
    if (fullname == "") {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập Họ tên!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }
    if (validateEmail(email) == false) return false;
    if (content == "") {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập nội dung!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }
    var d = {
      fullname: fullname,
      email: email,
      website: website,
      content: content,
      node_id: node_id,
      is_ajax: 1,
    };
  }
  if (type === "product") {
    if (!onStarx) {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng chọn đánh giá!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }

    if (fullname == "") {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập Họ tên!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }

    if (validateEmail(email) == false) return false;

    // if (content == '') {
    //     Swal.fire({
    //         icon: 'warning',
    //         text: 'Vui lòng nhập nội dung!',
    //         confirmButtonColor: '#ed6522'
    //     });
    //     return false;
    // }

    var d = {
      fullname: fullname,
      phone: phone,
      content: content,
      node_id: node_id,
      stars: onStarx,
      is_ajax: 1,
    };
  }

  var data = d;
  is_sending = true;
  console.log(data);
  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + `ajax/send_comment`,
    type: "post",
    data: data,
    dataType: "json",
    success: function (res) {
      Swal.fire({
        icon: "success",
        text: "Cảm ơn bạn đã bình luận, chúng tôi sẽ phê duyệt sớm nhất!",
        confirmButtonColor: "#ed6522",
      });
      $(".comment__form").trigger("reset");
      onStarx = 0;
      $(".star").find("use").attr("xlink:href", "#star-green");
      is_sending = false;
    },
    error: function (err) {
      is_sending = false;
      console.log(err);
    },
  });
}
//-----END COMMENT-----

function product_seen(id) {
  let productIds = JSON.parse(localStorage.getItem('productIds')) || [];

  if (!productIds.includes(id)) {
    productIds.push(id);
    localStorage.setItem('productIds', JSON.stringify(productIds));
  }
}

function render_product_seen() {
  let productIds = JSON.parse(localStorage.getItem('productIds')) || [];
  
  if(productIds.length > 0) {
    $(".product_watched").removeClass('hide');
    let products = [];

    var data = {
      type: "product",
      conn: {
        "Node.id IN": productIds
      },
    };
    
    $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + `ajax/get_data`,
    type: "post",
    data: data,
    dataType: "json",
    success: function (res) {
      if(res.res == 'done') {
        products = res.data;
        
        products.map((e) => {
          const size = e.Product.sizes.replace(/^,|,$/g, '').split(',').filter(Boolean);

          let product = `
            <div class="product-item">
                <div class="product-img">
                    <a href="${DOMAIN + e.Node.slug + '.html'}" class="wrap-img img-100">
                      <img src="${e.Product.image}" alt="${e.Node.title}" />
                    </a>
                </div>
                <div class="product-info">
                    <span class="product-brand"><a href="${link_product + '?brand=' + e.Hang.id}">${e.Hang.title}</a></span>
                    <h3>
                        <a href="${DOMAIN + e.Node.slug + '.html'}">${e.Node.title}</a>
                    </h3>
                    <div class="product-price">
                        <span>${
                          e.Product.price_off != '' && e.Product.price_off != 0 ? Number(e.Product.price_off).toLocaleString("en-US") +  ' - ' + Number(e.Product.price).toLocaleString("en-US") : Number(e.Product.price).toLocaleString("en-US")
                        }</span>
                    </div>
                    ${
                      size.length > 0 ? `<div class="product-capacity">${size.length} dung tích</div>` : ''
                    }
                </div>
                <a href="" class="btn-wishlist">
                    <svg width="28" height="28">
                        <use href="#icon-wishlist"></use>
                    </svg>
                </a>
            </div>
          `;

          const product_seen = $(`
            <div class="col-sm-2">
              ${product}
            </div>
          `);

          const product_seen_owl = $(product);

          $(".product_seen_list").append(product_seen);

          $(".home-product-seen-owl").trigger("add.owl.carousel", product_seen_owl);
          $(".home-product-seen-owl").trigger("refresh.owl.carousel");
        })
      }
      
      is_sending = false;
    },
    error: function (err) {
      is_sending = false;
      console.log(err);
    },
  });
  } else {
    $(".product_watched").addClass('hide');
  }
}

render_product_seen();

//-----TÀI KHOẢN-----

$(".btn-resgiter").on("click", () => {
  var username = $('.account-resgiter input[name="username"]').val();
  var fullname = $('.account-resgiter input[name="fullname"]').val();
  var phone = $('.account-resgiter input[name="phone"]').val();
  var email = $('.account-resgiter input[name="email"]').val();
  var pass = $('.account-resgiter input[name="password"]').val();
  if (username == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập tài khoản!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }
  if (fullname == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập họ tên!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }

  if (validateEmail(email) == false) return false;
  if (validatePhone(phone) == false) return false;
  if (pass == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập mật khẩu!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }
  var data = $(".account-resgiter").serialize();

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + "register",
    type: "post",
    data: data,
    dataType: "html",
    success: function (d) {
      console.log(d);
      let res = JSON.parse(d);
      let iconType = (res.res === 'done') ? 'success' : 'warning';
      Swal.fire({
        icon: iconType,
        text: res.msg,
        confirmButtonColor: "#ed6522",
      }).then(() => {
        if (res.res == "done") {
          location.href = DOMAIN + "login";
        }
      });
    },
    error: function (err) {
      console.log(err);
      Swal.fire({
        icon: "warning",
        text: "Có lỗi xảy ra.   ",
        confirmButtonColor: "#ed6522",
      });
    },
  });
});

$(".btn-login").on("click", () => {
  var data = $(".account-login").serialize();

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + "login",
    type: "post",
    data: data,
    dataType: "html",
    success: function (d) {
      console.log(d);
      let res = JSON.parse(d);

      if (res.res == "done") {
        location.href = DOMAIN + "user/dashboard";
      } else {
        Swal.fire({
          icon: "warning",
          text: res.msg,
          confirmButtonColor: "#ff6109",
        });
        return false;
      }
    },
    error: function (err) {
      console.log(err);
      Swal.fire({
        text: "Có lỗi xảy ra!",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#ff6109",
        cancelButtonColor: "#f46a6a",
      });
    },
  });
});

function reset_pass() {
  var email = $("#recover input[name=email]").val();
  if (email == "") {
    Swal.fire({
      title: "Vui lòng nhập email!",
      icon: "error",
      showCancelButton: false,
      confirmButtonColor: "#ff6109",
      cancelButtonColor: "#ff6109",
    });
    return false;
  }

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + "account/forget",
    data: { email: email },
    type: "post",
    dataType: "json",
    success: function (d) {
      console.log(email);
      if (d.res == "done")
        Swal.fire({
          title: d.msg,
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#ff6109",
          cancelButtonColor: "#ff6109",
        });
      else
        Swal.fire({
          title: "Có lỗi hãy kiểm tra và thử lại",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#ff6109",
          cancelButtonColor: "#ff6109",
        });

      console.log(d);
    },
    error: function (e) {
      console.log(e);
    },
  });
}

function open_modal_forget() {
  $("#recover").modal();
}

//-----End TÀI KHOẢN-----

$(document).ready(function () {
  $("#coupon .checkcoupon").on("click", function () {
    var coupon = $("input[name=coupon]").val();
    // console.log(coupon);
    var cart_sum = parseInt(
      document
        .querySelector("#total-cart-price")
        .textContent.trim()
        .replace(/,/g, "")
    );
    var count = 0;

    is_used_coupon = coupon;

    var data = {
      coupon,
      cart_sum,
    };

    if (coupon == "") {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng nhập mã giảm giá!",
        icon: "warning",
        showCancelButton: false,
        confirmButtonColor: "#ff6109",
        cancelButtonColor: "#ff6109",
      });
    }

    document.location.href = DOMAIN + 'cart/list?coupon=' + coupon;
  });
});

//-----Thanh toán
$(document).ready(function () {
  var regexFullname = /.+$/;
  var regexAddress = /.+$/;
  var regexContent = /.+$/;

  $(".btn-order").click(function (e) {
    e.preventDefault();
    var fullname = $(".form-cart-list input[name=fullname]").val();
    var phone = $(".form-cart-list input[name=phone]").val();
    var email = $(".form-cart-list input[name=email]").val();
    var address = $(".form-cart-list input[name=address]").val();
    var content = $(".form-cart-list textarea[name=content]").val();
    var check = true;

    if (!regexFullname.test(fullname)) {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập họ tên!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }

    if (validatePhone(phone) == false) return false;

    if (validateEmail(email) == false) return false;

    if (!regexAddress.test(address)) {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập địa chỉ!",
        confirmButtonColor: "#ed6522",
      });
      return false;
    }

    if (check) {
      var data = $(".form-cart-list").serialize();
      $.ajax({
          headers: {
              "X-CSRF-Token": csrfToken,
          },
          url: DOMAIN + "ajax/cart_order",
          type: "post",
          data: data,
          dataType: "json",
          success: function (res) {
              console.log(res);
              if (res.res == "done") {
                  Swal.fire({
                      title: 'Đặt hàng thành công',
                      text: 'Chúng tôi sẽ sớm liên hệ lại với bạn',
                      icon: "success",
                      showCancelButton: false,
                      confirmButtonColor: "#556ee6",
                  }).then(function () {
                      location.reload();
                  });
              } else {
                  Swal.fire({
                      title: res.msg,
                      text: res.data,
                      icon: "warning",
                      showCancelButton: false,
                      confirmButtonColor: "#556ee6",
                      cancelButtonColor: "#f46a6a",
                  });
              }
          },
          error: function (err) {
              console.log(err);
              Swal.fire({
                  title: "Thất bại!",
                  text: "Có lỗi xảy ra!",
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonColor: "#556ee6",
                  cancelButtonColor: "#f46a6a",
              });
          },
      });
    }
  });
});
//-----End thanh toán

//-----WISH LIST-----

function delete_wishlist(id) {
  Swal.fire({
    text: "Bạn có chắc muốn xóa sản phẩm này không? 😢",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Hủy",
    confirmButtonText: "Xóa",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = DOMAIN + "user/wishlist/wishlist_delete/" + id;
    }
  });
}

var is_sending = false;
$(".badge__heart").click(function (e) {
  e.preventDefault();
});

function wishlist(node_id, customer_id) {
  if (customer_id == 0) {
    need_login();
    return;
  }
  var image = $(".product__item-" + `${node_id}` + " .detail__thumb").attr(
    "src"
  );
  var title = $(".product__item-" + `${node_id}` + " .product-title").attr(
    "title"
  );
  var price = $(".product__item-" + `${node_id}` + " .price__ban").attr(
    "data-price"
  );
  if (is_sending == true) {
    return false;
  }
  var data = {
    customer_id: customer_id,
    node_id: node_id,
    image: image,
    title: title,
    price: price,
    is_ajax: 1,
  };

  // console.log(data);
  // return true
  is_sending = true;

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: DOMAIN + `ajax/send_wishlist`,
    type: "post",
    data: data,
    dataType: "json",
    success: function (res) {
      // console.log(res);
      Swal.fire({
        icon: "success",
        text: "Thêm vào danh sách yêu thích thành công!",
        showCancelButton: true,
        confirmButtonColor: "#ed6522",
        confirmButtonText: "Xem danh sách",
        cancelButtonColor: "#d33",
        cancelButtonText: "Tiếp tục",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = DOMAIN + "user/wishlist/wishlist_list";
        }
      });

      is_sending = false;
    },
    error: function (err) {
      console.log(err);
      Swal.fire({
        icon: "warning",
        text: "Có lỗi xảy ra!",
        confirmButtonColor: "#ed6522",
      });
      is_sending = false;
    },
  });
}

$(".btn_addwishlist").click(function () {
  Swal.fire({
    icon: "warning",
    confirmButtonText: "Xác nhận",
    text: "Sản phẩm đã có trong yêu thích!",
  });
});

//-----END WISH LIST-----

$(".subscribe__form button").click(function () {
  var str = "";

  email = $(".subscribe__form input").val();

  if (validateEmail(email) == false) return false;

  str = "email=" + email;

  console.log(str);

  $.ajax({
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    url: `${DOMAIN}contact/subcribe`,
    type: "post",
    data: str,
    dataType: "json",
    success: function (res) {
      if (res.res == "done") {
        Swal.fire({
          title: 'Thông báo',
          text: res.msg,
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#556ee6",
          cancelButtonColor: "#f46a6a",
        });
        $(".subscribe__form").trigger("reset");
      } else {
        Swal.fire({
          title: 'Thông báo',
          text: "Email của bạn đã được đăng ký trước đó. Vui lòng kiểm tra lại.",
          icon: "warning",
          showCancelButton: false,
          confirmButtonColor: "#556ee6",
          cancelButtonColor: "#f46a6a",
        });
      }
    },
    error: function (err) {
      console.log("Lỗi", err);
      // $('.loading-process').addClass('hide');
      Swal.fire({
        title: "Thất bại!",
        text: "Có lỗi xảy ra!",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#556ee6",
        cancelButtonColor: "#f46a6a",
      });
    },
  });

  return false;
});

$(".form__contact .contact__form-confirm").click(function () {
  var fullname = $(".form__contact input[name='fullname']").val();
  var email = $(".form__contact input[name='email']").val();
  var content = $(".form__contact textarea[name='content']").val();

  if (fullname == "") {
    Swal.fire({
      icon: "warning",
      text: "Vui lòng nhập Họ tên!",
      confirmButtonColor: "#ed6522",
    });
    return false;
  }

  if (validateEmail(email) == false) return false;

  var data = {
    title: "Liên hệ",
    fullname,
    email,
    content,
    is_ajax: 1,
  };

  $.ajax({
    url: `${DOMAIN}` + "contact",
    type: "post",
    data: data,
    dataType: "html",
    success: function (res) {
      Swal.fire({
        icon: "success",
        text: "Cảm ơn bạn đã liên hệ với chúng tôi. Vui lòng kiểm tra email của bạn để cập nhật thông tin.",
      });
      $(".form__contact").trigger("reset");
    },
    error: function (err) {
      Swal.fire({
        icon: "success",
        text: "Cảm ơn bạn đã liên hệ với chúng tôi. Vui lòng kiểm tra email của bạn để cập nhật thông tin.",
      });
      $(".form__contact").trigger("reset");
    },
  });
});

// -----END CONTACT
;
function ams_t(key, def) {
  var v = document.body.getAttribute("data-t-" + key);
  return v ? v : def;
}

function ams_alert(text, icon, done) {
  var auto = icon !== "warning" && icon !== "error" && !!done;
  Swal.fire({
    icon: icon || "success",
    text: text,
    confirmButtonText: ams_t("ok", "Đồng ý"),
    buttonsStyling: false,
    customClass: { popup: "ams-swal", confirmButton: "ams-swal-btn" },
    timer: auto ? 1500 : undefined,
    timerProgressBar: auto,
    returnFocus: !done
  }).then(function () {
    if (done) done();
  });
}

function ams_owl(sel, opt) {
  var $s = $(sel);
  if (!$s.length) return $s;
  return $s.owlCarousel(
    $.extend(
      {
        items: 1,
        margin: 0,
        nav: false,
        dots: false,
        smartSpeed: 600,
        navText: ["", ""]
      },
      opt
    )
  );
}

function ams_check_form($form) {
  var ok = true;
  $form.find("input, textarea, select").each(function () {
    var v = $.trim($(this).val()),
      type = $(this).attr("type");
    if (type === "hidden") return;
    if (type === "checkbox") v = this.checked ? v : "";
    var bad = $(this).prop("required") && !v;
    if (!bad && v && type === "email") bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
    if (!bad && v && type === "tel") bad = !/^[0-9+\-.\s()]{9,}$/.test(v);
    $(this).closest(".ams-field").toggleClass("error", bad);
    if (bad) ok = false;
  });
  return ok;
}

function ams_quote_send($form, done) {
  ams_alert(ams_t("sent", "Gửi yêu cầu thành công! AMS sẽ liên hệ lại với bạn sớm nhất."), "success", done);
}

$(function () {
  var $body = $("body");

  function closeMenu() {
    $(".ams-mm, .mm_overlay").removeClass("open");
    $body.removeClass("ams-lock");
  }

  $(document).on("click", ".btn_menu", function () {
    $(".ams-mm, .mm_overlay").addClass("open");
    $body.addClass("ams-lock");
  });

  $(document).on("click", ".btn_mm_close, .mm_overlay", closeMenu);

  $(document).on("click", ".lang_toggle", function (e) {
    e.stopPropagation();
    $(this).closest(".lang_box").toggleClass("open");
  });

  $(document).on("click", ".lang_item", function (e) {
    e.stopPropagation();
    var $box = $(this).closest(".lang_box");
    $box.find(".ams-lang-name").text($(this).data("lang"));
    $box.find(".lang_toggle .ams-flag use").attr("href", $(this).find("use").attr("href"));
    $box.find("li").removeClass("active");
    $(this).parent().addClass("active");
    $box.removeClass("open");
  });

  $(document).on("click", function () {
    $(".lang_box").removeClass("open");
  });

  $(document).on("submit", ".form_search", function (e) {
    var v = $.trim($(this).find("input[name='s']").val());
    if (!v) {
      e.preventDefault();
      ams_alert(ams_t("search", "Vui lòng nhập từ khóa tìm kiếm."), "warning");
    }
  });

  function openPopup() {
    $(".quote_popup").addClass("open");
    $body.addClass("ams-lock");
  }

  function closePopup() {
    $(".quote_popup").removeClass("open");
    $body.removeClass("ams-lock");
  }

  $(document).on("click", ".btn_quote", function (e) {
    e.preventDefault();
    closeMenu();
    $(".form_quote [name=product]").val($(this).data("product") || "");
    openPopup();
  });

  $(document).on("click", ".btn_popup_close", closePopup);

  $(document).on("click", ".quote_popup", function (e) {
    if (e.target === this) closePopup();
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closePopup();
      closeMenu();
    }
  });

  $(document).on("submit", ".form_quote", function (e) {
    e.preventDefault();
    var $form = $(this);
    if (!ams_check_form($form)) {
      ams_alert(ams_t("invalid", "Vui lòng nhập đầy đủ họ tên và số điện thoại hợp lệ."), "warning", function () {
        $form.find(".ams-field.error").first().find("input, textarea").trigger("focus");
      });
      return;
    }
    ams_quote_send($form, function () {
      $form[0].reset();
      closePopup();
    });
  });

  $(document).on("input change", ".ams-field.error input, .ams-field.error textarea, .ams-field.error select", function () {
    $(this).closest(".ams-field").removeClass("error");
  });

  var $slot = $(".ams-header-slot"),
    $header = $(".ams-header");
  function affix() {
    if (!$slot.length) return;
    if (!$header.hasClass("fixed")) $slot.css("min-height", $header.outerHeight());
    var on = $(window).scrollTop() > $slot.offset().top + $slot.outerHeight();
    if (on !== $header.hasClass("fixed")) $header.toggleClass("fixed", on);
  }
  $(window).on("scroll resize", affix);
  affix();

  function social() {
    $(".ams-quick").toggleClass("active", $(window).scrollTop() > 200);
  }
  $(window).on("scroll", social);
  social();

  $(document).on("click", ".btn_top", function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
  });

  var bgs = document.querySelectorAll("[data-bg]");
  if (bgs.length) {
    var setBg = function (el) {
      el.style.backgroundImage = "url(" + el.getAttribute("data-bg") + ")";
      el.removeAttribute("data-bg");
    };
    if (!("IntersectionObserver" in window)) {
      [].forEach.call(bgs, setBg);
    } else {
      var io = new IntersectionObserver(
        function (list) {
          list.forEach(function (en) {
            if (en.isIntersecting) {
              setBg(en.target);
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "300px" }
      );
      [].forEach.call(bgs, function (el) {
        if (el.getAttribute("data-eager")) setBg(el);
        else io.observe(el);
      });
    }
  }
});

new WOW({ animateClass: 'animate__animated', mobile: false }).init();

$(function () {
  var cur = $(".ams-nav-list > li.active").data("nav");
  if (cur) $(".ams-mm-list > li[data-nav='" + cur + "']").addClass("active");

  $(document).on("click", ".acc_head", function () {
    var $item = $(this).closest(".ams-faq-item"),
      open = $item.hasClass("open");
    $item.siblings(".open").removeClass("open").find(".ams-faq-body").stop().slideUp(250);
    $item.toggleClass("open", !open).find(".ams-faq-body").stop()[open ? "slideUp" : "slideDown"](250);
  });

  $(document).on("click", ".btn_read_more", function () {
    $(this).closest(".ams-seo-more").toggleClass("open");
  });
});

$(function () {
  function indShow(i) {
    var $tabs = $(".btn_ind_tab"),
      n = $tabs.length;
    if (!n) return;
    i = (i + n) % n;
    var $tab = $tabs.eq(i),
      $strip = $(".ind_strip");
    $tabs.removeClass("active");
    $tab.addClass("active");
    $(".ind_pane").removeClass("active").filter("[data-ind='" + $tab.data("ind") + "']").addClass("active");
    var left = $tab.position().left + $strip.scrollLeft() - ($strip.width() - $tab.outerWidth()) / 2;
    $strip.stop().animate({ scrollLeft: left }, 300);
  }

  $(document).on("click", ".btn_ind_tab", function () {
    indShow($(".btn_ind_tab").index(this));
  });

  $(document).on("click", ".btn_ind_prev", function () {
    indShow($(".btn_ind_tab").index($(".btn_ind_tab.active")) - 1);
  });

  $(document).on("click", ".btn_ind_next", function () {
    indShow($(".btn_ind_tab").index($(".btn_ind_tab.active")) + 1);
  });

  ams_owl(".partner_slider", {
    items: 4,
    margin: 58,
    slideBy: 1,
    dotsEach: 1,
    dots: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 2, margin: 12 },
      768: { items: 3, margin: 20 },
      1200: { items: 4, margin: 40 },
      1400: { items: 4, margin: 58 }
    }
  });

  ams_owl(".news_slider", {
    items: 4,
    margin: 20,
    dots: true,
    slideBy: 1,
    dotsEach: 1,
    responsive: {
      0: { items: 2, margin: 12 },
      768: { items: 3, margin: 20 },
      1200: { items: 4, margin: 20 }
    }
  });

  ams_owl(".event_slider", {
    items: 4,
    margin: 20,
    dots: true,
    slideBy: 1,
    dotsEach: 1,
    responsive: {
      0: { items: 2, margin: 12 },
      768: { items: 3, margin: 20 },
      1200: { items: 4, margin: 20 }
    }
  });

  var $review = ams_owl(".review_slider", {
    items: 1,
    loop: true,
    autoHeight: true,
    smartSpeed: 500
  });

  $(document).on("click", ".btn_review_prev", function () {
    $review.trigger("prev.owl.carousel");
  });

  $(document).on("click", ".btn_review_next", function () {
    $review.trigger("next.owl.carousel");
  });
});

$(function () {
  $(document).on("click", ".btn_facet", function () {
    $(this).parent().toggleClass("open");
  });

  $(document).on("click", ".btn_filter", function () {
    $(this).closest(".ams-sp-side").toggleClass("open");
  });
});

$(function () {
  var $main = $(".pd_main_slider"),
    $thumb = $(".pd_thumb_slider"),
    $lb = $(".pd_lightbox"),
    lbIdx = 0;

  function thumbActive(i) {
    $(".btn_pd_thumb").removeClass("active").eq(i).addClass("active");
    $thumb.trigger("to.owl.carousel", [i, 300]);
  }

  $main.on("changed.owl.carousel", function (e) {
    if (e.item && e.item.index !== null) thumbActive(e.item.index);
  });

  ams_owl(".pd_main_slider", { items: 1 });
  ams_owl(".pd_thumb_slider", { items: 4, margin: 20, responsive: { 0: { items: 4, margin: 12 }, 768: { items: 4, margin: 20 } } });
  ams_owl(".pd_rel_slider", {
    items: 4,
    margin: 20,
    dots: true,
    slideBy: 1,
    dotsEach: 1,
    responsive: {
      0: { items: 1, margin: 12 },
      768: { items: 2, margin: 20 },
      992: { items: 3, margin: 20 },
      1200: { items: 4, margin: 20 }
    }
  });

  $(document).on("click", ".btn_pd_thumb", function () {
    var i = $(".btn_pd_thumb").index(this);
    $main.trigger("to.owl.carousel", [i, 300]);
    thumbActive(i);
  });

  function lbShow(i) {
    var $a = $(".btn_pd_zoom"),
      n = $a.length;
    lbIdx = (i + n) % n;
    $lb.find(".ams-lb-img").attr({ src: $a.eq(lbIdx).attr("href"), alt: $a.eq(lbIdx).find("img").attr("alt") });
    $main.trigger("to.owl.carousel", [lbIdx, 300]);
    thumbActive(lbIdx);
  }

  function lbClose() {
    $lb.removeClass("open");
    $("body").removeClass("ams-lock");
  }

  $(document).on("click", ".btn_pd_zoom", function (e) {
    e.preventDefault();
    lbShow($(".btn_pd_zoom").index(this));
    $lb.addClass("open");
    $("body").addClass("ams-lock");
  });

  $(document).on("click", ".btn_lb_prev", function () {
    lbShow(lbIdx - 1);
  });

  $(document).on("click", ".btn_lb_next", function () {
    lbShow(lbIdx + 1);
  });

  $(document).on("click", ".btn_lb_close", lbClose);

  $(document).on("click", ".pd_lightbox", function (e) {
    if (e.target === this) lbClose();
  });

  $(document).on("keydown", function (e) {
    if (!$lb.hasClass("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
    if (e.key === "ArrowRight") lbShow(lbIdx + 1);
  });

  $(document).on("click", ".btn_pd_tab", function () {
    var i = $(this).data("tab");
    $(".btn_pd_tab").removeClass("active");
    $(this).addClass("active");
    $(".ams-pd-pane").removeClass("active").eq(i).addClass("active");
  });
});

$(function () {
  $(document).on("click", ".btn_copy_link", function () {
    var url = window.location.href,
      done = function () {
        ams_alert(ams_t("copied", "Đã sao chép liên kết bài viết."), "success");
      };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done);
      return;
    }
    var $t = $("<textarea>").val(url).appendTo("body").select();
    document.execCommand("copy");
    $t.remove();
    done();
  });
});

$(function () {
  $(document).on("submit", ".form_contact", function (e) {
    e.preventDefault();
    var $form = $(this);
    if (!ams_check_form($form)) {
      ams_alert(ams_t("invalid_contact", "Vui lòng điền đủ các ô có dấu * và email hợp lệ."), "warning", function () {
        $form.find(".ams-field.error").first().find("input, textarea, select").trigger("focus");
      });
      return;
    }
    ams_quote_send($form, function () {
      $form[0].reset();
    });
  });
});

;
function ams_quote_send($form, done) {
  var $btn = $form.find("[type=submit]"),
    val = function (n) {
      return $.trim($form.find("[name=" + n + "]").val() || "");
    },
    product = val("product"),
    subject = val("subject"),
    content = val("content"),
    extra = [];
  if (subject) {
    if (val("company")) extra.push("Công ty: " + val("company"));
    if (product) extra.push("Mã sản phẩm: " + product);
    if (extra.length) content = extra.join("\n") + (content ? "\n\n" + content : "");
  }
  $btn.prop("disabled", true);
  $.ajax({
    url: DOMAIN + "contact",
    type: "POST",
    dataType: "json",
    headers: { "X-CSRF-Token": typeof csrfToken !== "undefined" ? csrfToken : "" },
    data: {
      title: subject ? subject : "Yêu cầu báo giá" + (product ? ": " + product : ""),
      fullname: val("fullname") || $.trim(val("first_name") + " " + val("last_name")),
      phone: val("phone"),
      email: val("email"),
      address: val("city"),
      content: content
    },
    success: function (r) {
      if (r && r.res === "done") ams_alert(ams_t("sent", r.msg), "success", done);
      else ams_alert(ams_t("fail", (r && r.msg) || "Gửi không thành công, vui lòng thử lại."), "warning");
    },
    error: function () {
      ams_alert(ams_t("offline", "Không kết nối được máy chủ, vui lòng thử lại."), "warning");
    },
    complete: function () {
      $btn.prop("disabled", false);
    }
  });
}

$(function () {
  $(".btn_cho_js").prop("disabled", false);
});

$(document).on("click", ".mm_toggle", function () {
  var $li = $(this).closest(".ams-mm-has");
  $li.toggleClass("open").children(".ams-mm-child").stop(true).slideToggle(250);
});

function ams_seo_fit() {
  $(".ams-hero-more").each(function () {
    var $box = $(this),
      el = $box.find(".ams-seo-text")[0];
    if ($box.hasClass("open")) return;
    $box.removeClass("ams-seo-fit").toggleClass("ams-seo-fit", el.scrollHeight <= el.clientHeight + 2);
  });
}

$(function () {
  ams_seo_fit();
  $(window).on("resize", ams_seo_fit);
});
