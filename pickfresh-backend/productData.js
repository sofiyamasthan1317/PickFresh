const products = [
  // 1. Produce
{ id: 1, name: "Apple", quantity: "1 kg", price: "₹150", image: "https://media.istockphoto.com/id/185262648/photo/red-apple-with-leaf-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=gUTvQuVPUxUYX1CEj-N3lW5eRFLlkGrU_cwwwOWxOh8=", categoryId: "Produce" },
{ id: 2, name: "Banana", quantity: "1 dozen", price: "₹60", image: "https://media.istockphoto.com/id/172876004/photo/banana-wallpaper.jpg?b=1&s=612x612&w=0&k=20&c=5U7GItR7BVTfNQM1MUaxf3lsb3W3lJaNYFt0mpH0_Rg=", categoryId: "Produce" },
{ id: 3, name: "Tomato", quantity: "1 kg", price: "₹40", image: "https://media.istockphoto.com/id/1450576005/photo/tomato-isolated-tomato-on-white-background-perfect-retouched-tomatoe-side-view-with-clipping.jpg?s=612x612&w=0&k=20&c=lkQa_rpaKpc-ELRRGobYVJH-eMJ0ew9BckCqavkSTA0=", categoryId: "Produce" },
{ id: 4, name: "Potato", quantity: "1 kg", price: "₹30", image: "https://media.istockphoto.com/id/157430678/photo/three-potatoes.jpg?s=612x612&w=0&k=20&c=qkMoEgcj8ZvYbzDYEJEhbQ57v-nmkHS7e88q8dv7TSA=", categoryId: "Produce" },
{ id: 5, name: "Onion", quantity: "1 kg", price: "₹35", image: "https://media.istockphoto.com/id/175448479/photo/red-onion-slice.jpg?s=612x612&w=0&k=20&c=LN1FqmYnwbHkhgBxV9FQ9zFm52iJKo1gO1EwNjbKuAw=", categoryId: "Produce" },
{ id: 6, name: "Carrot", quantity: "1 kg", price: "₹50", image: "https://media.istockphoto.com/id/1388403435/photo/fresh-carrots-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=XmrTb_nASc7d-4zVKUz0leeTT4fibDzWi_GpIun0Tlc=", categoryId: "Produce" },

  // 2. Dairy
{ id: 7, name: "Milk", quantity: "1 litre", price: "₹60", image: "https://media.istockphoto.com/id/512750786/photo/fresh-milk-on-the-table.jpg?s=612x612&w=0&k=20&c=9Ig8OrEMyGj-p2iW_5UCdSCd74cBWtADqaJgJtq_MLM=", categoryId: "Dairy" },
{ id: 8, name: "Cheese", quantity: "200 gm", price: "₹120", image: "https://media.istockphoto.com/id/178421857/photo/various-types-of-cheese.jpg?s=612x612&w=0&k=20&c=7OJWQOlQASFNmKmgAjf-QpCsIC4lhMylHyXvxBVOJRg=", categoryId: "Dairy" },
{ id: 9, name: "Butter", quantity: "500 gm", price: "₹250", image: "https://media.istockphoto.com/id/179875636/photo/butter.jpg?s=612x612&w=0&k=20&c=dQjAemP1f3RDr64uN7gN5TQCZI6XkkgijtWYo9yTB7o=", categoryId: "Dairy" },
{ id: 10, name: "Curd", quantity: "500 gm", price: "₹50", image: "https://media.istockphoto.com/id/1500599620/photo/fresh-curd-and-herbs-dairy-product.jpg?b=1&s=612x612&w=0&k=20&c=lTLcKmwvfqIz48Y6pOL4eiWyV5qoBdxFVjQKv7fmPyM=", categoryId: "Dairy" },
{ id: 11, name: "Paneer", quantity: "250 gm", price: "₹140", image: "https://media.istockphoto.com/id/1183707972/photo/paneer-cottage-cheese-close-up.jpg?b=1&s=612x612&w=0&k=20&c=nJhDi30iE4y7s9DhjI6g4VxGxbMQZ6f9uStkAcumnhM=", categoryId: "Dairy" },
{ id: 12, name: "Ghee", quantity: "500 ml", price: "₹300", image: "https://media.istockphoto.com/id/1187181045/photo/pure-or-desi-ghee-clarified-melted-butter-healthy-fats-bulletproof-diet-concept-or-paleo.jpg?s=612x612&w=0&k=20&c=5Zmc6rSTKGoAUPbLIklt7YUNDKt2d3Zx9HcnN3cGwS0=", categoryId: "Dairy" },


  // 3. Bakery
{ id: 13, name: "Bread", quantity: "1 loaf", price: "₹50", image: "https://media.istockphoto.com/id/1004827186/photo/sliced-bread-on-white.jpg?s=612x612&w=0&k=20&c=gMoMq9cxekB4iNS7lOToPwm6SuXh5YVu-aodVpw9C34=", categoryId: "Bakery" },
{ id: 14, name: "Buns", quantity: "4 pcs", price: "₹40", image: "https://media.istockphoto.com/id/1016293490/photo/plain-hamburger-bun.jpg?s=612x612&w=0&k=20&c=fKpxbn1TLc9NK9_Vzp1cj_evCCIH2W38B44nXBBQdPo=", categoryId: "Bakery" },
{ id: 15, name: "Croissant", quantity: "2 pcs", price: "₹80", image: "https://media.istockphoto.com/id/545086644/photo/fresh-baked-croissant.jpg?s=612x612&w=0&k=20&c=5NGJmcKZpXLbjyPdWmzFFmoZArDwJ01OVwCeuOyDkvo=", categoryId: "Bakery" },
{ id: 16, name: "Cake", quantity: "500 gm", price: "₹400", image: "https://media.istockphoto.com/id/1349560821/photo/traditional-vanilla-pound-cake-with-orange-extract-bundt-cake.jpg?s=612x612&w=0&k=20&c=zyRXeNJIUVzVVhxujIPsnEfAoczJGmab1X9fKfOXWv8=", categoryId: "Bakery" },
{ id: 17, name: "Cookies", quantity: "250 gm", price: "₹120", image: "https://media.istockphoto.com/id/517109442/photo/chocolate-chip-cookie-isolated.jpg?s=612x612&w=0&k=20&c=RgZOYwzVRTXnIBy8zSkXK-wJfNBy9w023UGULkbH_VE=", categoryId: "Bakery" },
{ id: 18, name: "Doughnuts", quantity: "3 pcs", price: "₹150", image: "https://media.istockphoto.com/id/465529983/photo/field-of-different-types-of-donuts.jpg?s=612x612&w=0&k=20&c=J1yVwdu0KlQ5JTJ8aEVlFRrshPDDkvYrORfDYsWbIR8=", categoryId: "Bakery" },

  // 4. Beverages
{ id: 19, name: "Orange Juice", quantity: "1 litre", price: "₹100", image: "https://media.istockphoto.com/id/152971676/photo/glass-of-orange-juice-and-fresh-oranges.jpg?s=612x612&w=0&k=20&c=PLfvkn63OMHN8epb8F9Yfx48BsBOxWzfwL2BSWdV1Nw=", categoryId: "Beverages" },
{ id: 20, name: "Tea", quantity: "250 gm", price: "₹150", image: "https://media.istockphoto.com/id/1296650267/photo/indian-chai-in-glass-cups-with-metal-kettle-and-other-masalas-to-make-the-tea.jpg?s=612x612&w=0&k=20&c=9NDLUBJhjf6dgf82AX4s4dQ6-scqdDcnxP3kN6INoEw=", categoryId: "Beverages" },
{ id: 21, name: "Coffee", quantity: "200 gm", price: "₹200", image: "https://media.istockphoto.com/id/1467199060/photo/cup-of-coffee-with-smoke-and-coffee-beans-on-old-wooden-background.jpg?s=612x612&w=0&k=20&c=OnS8_6FM5ussfSGmjpDD-GofERg2UbItdxShIAA90sQ=", categoryId: "Beverages" },
{ id: 22, name: "Coca-Cola", quantity: "2 litre", price: "₹90", image: "https://media.istockphoto.com/id/1393991948/photo/cola-with-crushed-ice-in-glass-and-there-is-water-droplets-around-cool-black-fresh-drink.jpg?s=612x612&w=0&k=20&c=St-ONdM6Tpg_DPFzZzq-OI-dsIG2Hv30KVdYf83ARs8=", categoryId: "Beverages" },
{ id: 23, name: "Energy Drink", quantity: "500 ml", price: "₹110", image: "https://media.istockphoto.com/id/155073322/photo/sport-drink.jpg?s=612x612&w=0&k=20&c=K4w3AIAbWwQ-84FDSwgw6liVaU_vUoxc0HjYveZ4DPo=", categoryId: "Beverages" },
{ id: 24, name: "Lemonade", quantity: "1 litre", price: "₹80", image: "https://media.istockphoto.com/id/500202440/photo/freshly-made-lemonade-with-a-hint-of-mint.jpg?s=612x612&w=0&k=20&c=sn3OLyO3awUjDhX55Qjsx44ftQ8ABqA8zMS0zjPIxDA=", categoryId: "Beverages" },

  // 5. Snacks
{ id: 25, name: "Potato Chips", quantity: "150 gm", price: "₹50", image: "https://media.istockphoto.com/id/891663430/photo/hands-giving-bowl-of-potato-chips-on-brown-background.jpg?s=612x612&w=0&k=20&c=-nU0_zCo09H0BibeIxlcQGh8irmZA4A4UEOLu-4mAjg=", categoryId: "Snacks" },
{ id: 26, name: "Namkeen", quantity: "500 gm", price: "₹80", image: "https://media.istockphoto.com/id/1457664912/photo/cocktail-nuts-mix.jpg?s=612x612&w=0&k=20&c=yFzLJlEm35ReCuJNhFyr-kbKNLE0D2iJjHDAy8hMY4g=", categoryId: "Snacks" },
{ id: 27, name: "Chocolate Bar", quantity: "100 gm", price: "₹90", image: "https://media.istockphoto.com/id/121282958/photo/chocolate.jpg?s=612x612&w=0&k=20&c=1xeIgyXLCGmFkIvW0rUvglDvi_3BBu-OsUtYRRl0OQU=", categoryId: "Snacks" },
{ id: 28, name: "Biscuits", quantity: "300 gm", price: "₹60", image: "https://media.istockphoto.com/id/1035053764/photo/beautiful-cookies-assorted-close-up-background-horizontal-top-view.jpg?s=612x612&w=0&k=20&c=5blbYcRKIYxN3SFGnUxY4xB9PcEaScd4-HCmyiQvcew=", categoryId: "Snacks" },
{ id: 29, name: "Popcorn", quantity: "200 gm", price: "₹70", image: "https://media.istockphoto.com/id/497857462/photo/popcorn-in-bucket.jpg?s=612x612&w=0&k=20&c=16mUWDBsQt4EpO-k3C-OqLiDfuigkawrxS1C6Y0cQuM=", categoryId: "Snacks" },
{ id: 30, name: "Trail Mix", quantity: "250 gm", price: "₹200", image: "https://media.istockphoto.com/id/884365696/photo/organic-raw-nuts-mix-of-pistachios-almonds-walnuts-dried-mulberries-dried-figs-and-hazelnuts.jpg?s=612x612&w=0&k=20&c=XJKIlwgAICsCwtbUBYEjflUFYo7E0wosgJ62InvSAak=", categoryId: "Snacks" },

  // 6. Personal Care
{ id: 31, name: "Toothpaste", quantity: "200 gm", price: "₹99", image: "https://media.istockphoto.com/id/1096108406/photo/new-toothbrush-with-toothpaste-close-up-in-the-bathroom-on-a-mirror-table-with-water-drops-on.jpg?s=612x612&w=0&k=20&c=WHUx-Tba8jUD-bBDhsqj4yuXKdZ5r7NjhkodN6kc8N0=", categoryId: "Personal Care" },
{ id: 32, name: "Shampoo", quantity: "300 ml", price: "₹180", image: "https://media.istockphoto.com/id/1701051000/photo/black-bottle-with-dispenser-pump-and-orchid-flower.jpg?s=612x612&w=0&k=20&c=bEyH-nnGY1Q52Fd9W6A71uxyPcHygmYgrjNHPmVa6Bk=", categoryId: "Personal Care" },
{ id: 33, name: "Soap", quantity: "4 pcs", price: "₹120", image: "https://media.istockphoto.com/id/1212680808/photo/natural-green-soap-and-eucalyptus-leaves-on-a-straw-plate-vertical-format-organic.jpg?s=612x612&w=0&k=20&c=qQGEqbStjfJKfTU6hiGq_BMwWiquefW2_SjBkHOqBgY=", categoryId: "Personal Care" },
{ id: 34, name: "Face Cream", quantity: "100 gm", price: "₹250", image: "https://media.istockphoto.com/id/1207674159/photo/beauty-and-fashion.jpg?s=612x612&w=0&k=20&c=51aF_3-H8qWvpdjRUKkqFLI7_edS881gaO66D4aYss4=", categoryId: "Personal Care" },
{ id: 35, name: "Hand Sanitizer", quantity: "500 ml", price: "₹130", image: "https://media.istockphoto.com/id/1372350278/photo/hand-sanitizer.jpg?s=612x612&w=0&k=20&c=WVG34qN3_Rxd5jborLJR7mPL9_DaYlL-nhDoGp8_An4=", categoryId: "Personal Care" },
{ id: 36, name: "Deodorant", quantity: "150 ml", price: "₹190", image: "https://media.istockphoto.com/id/92082556/photo/spraying-deodorant.jpg?b=1&s=612x612&w=0&k=20&c=E1oeUJrRqT2TgVsk5rRHTuCHIA5WdUl82Cc6JnJb86o=", categoryId: "Personal Care" },

  // 7. Household
{ id: 37, name: "Laundry Detergent", quantity: "1 kg", price: "₹220", image: "https://media.istockphoto.com/id/512574098/photo/laundry-detergent-bottle.jpg?s=612x612&w=0&k=20&c=R84mRWZH90V4wWzIIwYzlrEMdbRAM0jJTlKs09_fIZ8=", categoryId: "Household" },
{ id: 38, name: "Dish Soap", quantity: "750 ml", price: "₹80", image: "https://media.istockphoto.com/id/172857643/photo/a-bottle-of-green-dishwashing-detergent.jpg?s=612x612&w=0&k=20&c=ju5nySSFkbl71iY4Lvi0mWRYaWzxsY2PHOrzU2Zbhvc=", categoryId: "Household" },
{ id: 39, name: "Cleaning Spray", quantity: "500 ml", price: "₹150", image: "https://media.istockphoto.com/id/1150282133/photo/cleaning-window-pane-with-detergent.jpg?s=612x612&w=0&k=20&c=BkzVas8qZ_VLxLDWpDAPbVSDRXgRFMxbI3_NHcamUfk=", categoryId: "Household" },
{ id: 40, name: "Garbage Bags", quantity: "20 pcs", price: "₹120", image: "https://media.istockphoto.com/id/467408308/photo/garbage-bag-trash-waste.jpg?b=1&s=612x612&w=0&k=20&c=rBCKgwTUKfIpznJ4MylGXjYeIqTQtYVbkQUyiEuEu24=", categoryId: "Household" },
{ id: 41, name: "Floor Cleaner", quantity: "1 litre", price: "₹110", image: "https://media.istockphoto.com/id/1480372898/photo/housekeeping-cleaning-and-woman-maid-with-a-mop-to-clean-the-living-room-floor-at-a-house.jpg?s=612x612&w=0&k=20&c=Ti32ifO6-Igv78czD8vfxJAT6H0wfkJUiWVoGRZIFTc=", categoryId: "Household" },
{ id: 42, name: "Paper Towels", quantity: "3 rolls", price: "₹160", image: "https://media.istockphoto.com/id/167771183/photo/kitchen-towel.jpg?s=612x612&w=0&k=20&c=0ZVon0a5y1oozrQ400E8YHaZkZfVVrSduzD3bIZTbb0=", categoryId: "Household" },

  // 8. Meat
{ id: 43, name: "Chicken Breast", quantity: "500 gm", price: "₹250", image: "https://media.istockphoto.com/id/511486326/photo/raw-chicken-fillets-close-up-isolated-on-white.jpg?s=612x612&w=0&k=20&c=ptabozbp4iO9pLZONQqjlUTSUfUl02Df37G19IOIfGU=", categoryId: "Meat" },
{ id: 44, name: "Mutton", quantity: "500 gm", price: "₹450", image: "https://media.istockphoto.com/id/538918713/photo/lamb-chops.jpg?s=612x612&w=0&k=20&c=qRiDgM6Pp7mKLcIf_hIy6o4jom6J-wGrtkRMaXw5RaM=", categoryId: "Meat" },
{ id: 45, name: "Fish", quantity: "1 kg", price: "₹400", image: "https://media.istockphoto.com/id/1458011470/photo/full-frame-image-of-pile-of-red-bellied-pacu-with-rows-of-other-fish-fish-market-stall.jpg?s=612x612&w=0&k=20&c=EPqDFbzrnvf212YPtZdQ93QRrSc1R3aKVeOetZLmHMs=", categoryId: "Meat" },
{ id: 46, name: "Eggs", quantity: "12 pcs", price: "₹80", image: "https://media.istockphoto.com/id/1225497647/photo/eggs-white-eggs-on-isolated-background.jpg?s=612x612&w=0&k=20&c=StCOeKg_oY32SXj967hCmz_POf4q7SRst6bmlZtXk5U=", categoryId: "Meat" },
{ id: 47, name: "Prawns", quantity: "500 gm", price: "₹500", image: "https://media.istockphoto.com/id/1172658866/video/freshly-caught-australian-prawns.jpg?s=640x640&k=20&c=IqYSEuZTNem0rK3P2A1BihsM6c9GjmEtKOS5bjyq9xo=", categoryId: "Meat" },
{ id: 48, name: "Sausage", quantity: "400 gm", price: "₹240", image: "https://media.istockphoto.com/id/928891704/photo/woman-chooses-sausages-in-vacuum-package-at-store.jpg?s=612x612&w=0&k=20&c=iYfx_-TMAb9L_v6YheqL2APGKPnV56melNQ5Tif0pq4=", categoryId: "Meat" },

  // 9. Frozen
{ id: 49, name: "Frozen Peas", quantity: "1 kg", price: "₹150", image: "https://media.istockphoto.com/id/499226607/photo/frozen-peas.jpg?s=612x612&w=0&k=20&c=X600R_BD_mZi_3g7tz03e9W8cE6oMW0vFy_6w86-lUo=", categoryId: "Frozen" },
{ id: 50, name: "Ice Cream", quantity: "500 ml", price: "₹200", image: "https://media.istockphoto.com/id/1161805849/photo/strawberry-vanilla-chocolate-ice-cream-with-waffle-cone-on-marble-stone-backgrounds.jpg?s=612x612&w=0&k=20&c=BXObHKE0gbA2autsMZGFeEmK2xGKYdJBbM1_ig0Boyk=", categoryId: "Frozen" },
{ id: 51, name: "Frozen Pizza", quantity: "400 gm", price: "₹300", image: "https://media.istockphoto.com/id/610143830/photo/delicious-mouth-watering-raw-frozen-pizza-on-a-kitchen-table.jpg?s=612x612&w=0&k=20&c=d84caTemPyGztez_roCPmNv1r_skNOCs4Jikdgvt3uA=", categoryId: "Frozen" },
{ id: 52, name: "Frozen Corn", quantity: "1 kg", price: "₹140", image: "https://media.istockphoto.com/id/522880289/photo/frozen-sweetcorn.jpg?b=1&s=612x612&w=0&k=20&c=BDVKA8ITpo0E3NHxUl9drMyM01j8fNn9ptiWvjJREGk=", categoryId: "Frozen" },
{ id: 53, name: "Frozen Fries", quantity: "750 gm", price: "₹180", image: "https://media.istockphoto.com/id/671770262/photo/frozen-french-fries.jpg?", categoryId: "Frozen" },
{ id: 54, name: "Frozen Berries", quantity: "500 gm", price: "₹400", image: "https://media.istockphoto.com/id/1214302685/photo/bunch-of-frozen-berry-fruit-background-pattern.jpg?b=1&s=612x612&w=0&k=20&c=JmjVo6FNWUFgPjp7uH1gLhhh8blYtEQEhVRH2FMB6D8=", categoryId: "Frozen" },

  // 10. Baby Care
{ id: 55, name: "Diapers", quantity: "20 pcs", price: "₹350", image: "https://media.istockphoto.com/id/533725934/photo/stacks-diapers-for-children-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=mdNYdUjVkXGfzSZjRSRVj9Fh8E9rNxruTfTNQsUK6-0=", categoryId: "Baby Care" },
{ id: 56, name: "Baby Wipes", quantity: "80 pcs", price: "₹200", image: "https://media.istockphoto.com/id/476331938/photo/wet-wipe-on-a-white-background.jpg?b=1&s=612x612&w=0&k=20&c=ZkzIibJVwTr19rdQicdKDI77vwByrRKNQwc4MVzHdRg=", categoryId: "Baby Care" },
{ id: 57, name: "Baby Powder", quantity: "400 gm", price: "₹180", image: "https://media.istockphoto.com/id/680008570/photo/powder.jpg?b=1&s=612x612&w=0&k=20&c=9gAkYMVPgAsUvmqXiEH1SqA0wm9bIoQybwRS2R3poTY=", categoryId: "Baby Care" },
{ id: 58, name: "Baby Shampoo", quantity: "200 ml", price: "₹160", image: "https://media.istockphoto.com/id/157593034/photo/bathtub-memories.jpg?b=1&s=612x612&w=0&k=20&c=0kre8FXF32yrkXxueerJZZJxwVHfk0F4dABw7OOFjCA=", categoryId: "Baby Care" },
{ id: 59, name: "Baby Lotion", quantity: "300 ml", price: "₹250", image: "https://media.istockphoto.com/id/464877906/photo/babys-bath-box.jpg?s=612x612&w=0&k=20&c=FSufdctPbdMWTLHcEPRUgPL1Hbk6phnEcL3_qGUUhUU=", categoryId: "Baby Care" },
{ id: 60, name: "Baby Food", quantity: "500 gm", price: "₹300", image: "https://media.istockphoto.com/id/1370678609/photo/healthy-baby-food-on-white-wooden-table-closeup.jpg?s=612x612&w=0&k=20&c=Fm9yeYJory8uM_sS4jdgrbWVr6IMpCVB9K9trVVwoQ4=", categoryId: "Baby Care" },

  // 11. Stationery
{ id: 61, name: "Notebook", quantity: "1 pc", price: "₹80", image: "https://media.istockphoto.com/id/1410042111/vector/notepad-with-a-vertical-spring-spiral-notebook-with-a-lined-sheet-vector-illustration-on-a.jpg?s=612x612&w=0&k=20&c=sKhFSS00srDFm1q7uMFkWx_ZtW0o7cQ6rRFHsptwWus=", categoryId: "Stationery" },
{ id: 62, name: "Pens", quantity: "5 pcs", price: "₹50", image: "https://media.istockphoto.com/id/183057646/photo/set-of-eight-different-pens.jpg?s=612x612&w=0&k=20&c=ZuFoROqG5wdAR09UoqpjlaOnOABDeku6n3f0Ih9xT8o=", categoryId: "Stationery" },
{ id: 63, name: "Pencils", quantity: "10 pcs", price: "₹40", image: "https://media.istockphoto.com/id/1128768974/vector/set-of-yellow-pencils-red-and-black-sharpened-with-a-rubber-band-and-without-stock-vector.jpg?s=612x612&w=0&k=20&c=J7nBJPdZJxdoRtnEyyBYC6XuazVKQi59nhaBNerGtlM=", categoryId: "Stationery" },
{ id: 64, name: "Eraser", quantity: "3 pcs", price: "₹20", image: "https://media.istockphoto.com/id/1389911660/photo/used-pink-eraser.jpg?s=612x612&w=0&k=20&c=Eqfz02-3cKntkFbtNn8i7wod5FEZqD8EpwLA30xnpi8=", categoryId: "Stationery" },
{ id: 65, name: "Sharpener", quantity: "2 pcs", price: "₹15", image: "https://media.istockphoto.com/id/2166490986/photo/graphite-wooden-pencil-sharpner-and-eraser-for-office-supplies-or-student-stationery-isolated.jpg?b=1&s=612x612&w=0&k=20&c=lbNoz1kjXIzGrtX4tP5jr4HElg1v2wKftS7Cw5rDiS8=", categoryId: "Stationery" },
{ id: 66, name: "Sketch Pens", quantity: "12 pcs", price: "₹120", image: "https://media.istockphoto.com/id/1413042865/photo/sketches.jpg?b=1&s=612x612&w=0&k=20&c=HCnYYL0Xy3U-zVWu04xqlGdr_PQgB_Ub-sXA37uhf3Y=", categoryId: "Stationery" },

  // 12. Organic
{ id: 67, name: "Organic Honey", quantity: "500 gm", price: "₹350", image: "https://media.istockphoto.com/id/157580403/photo/honey.jpg?s=612x612&w=0&k=20&c=Py8XnCj1vegt7JGXdAuhhSqke1j67U88bXSWbbry4ro=", categoryId: "Organic" },
{ id: 68, name: "Organic Tea", quantity: "250 gm", price: "₹240", image: "https://media.istockphoto.com/id/1319095436/photo/ingredients-in-a-small-glass-of-herbal-tea-ingredients-are-ginger-basil-cardamom-cloves-on.jpg?s=612x612&w=0&k=20&c=6YdQcyph-cYnf3IVevosYaxtvA4F7p_4GOeivGxlMCA=", categoryId: "Organic" },
{ id: 69, name: "Organic Almonds", quantity: "500 gm", price: "₹600", image: "https://media.istockphoto.com/id/171292794/photo/almond.jpg?s=612x612&w=0&k=20&c=CTw_CkbEuxCrHKn5D0y7Z0YR6Cp__zVsPvwl3OaPzvA=", categoryId: "Organic" },
{ id: 70, name: "Organic Rice", quantity: "1 kg", price: "₹120", image: "https://media.istockphoto.com/id/671580286/photo/rice.jpg?s=612x612&w=0&k=20&c=Eo4qfXQVximdCyp5OBfDEi5eObBM17zphPv_V_DOuOg=", categoryId: "Organic" },
{ id: 71, name: "Organic Oil", quantity: "1 litre", price: "₹400", image: "https://media.istockphoto.com/id/1317729366/photo/various-vegetable-and-nut-oil-in-bottles-on-a-bright-background.jpg?s=612x612&w=0&k=20&c=tf5l5TyY6WUPlq0F9sOG9kPO26iFOVvwWS3uQ-S4FN8=", categoryId: "Organic" },
{ id: 72, name: "Organic Flour", quantity: "1 kg", price: "₹80", image: "https://media.istockphoto.com/id/861019856/photo/whole-grain-flour-in-a-wooden-bowl-and-sackcloth-bagwith-ears.jpg?s=612x612&w=0&k=20&c=TMt0RqMcxGkyhtdso5tDywcbkWNEbSB8tzAxngrW8PA=", categoryId: "Organic" },

];


module.exports=products