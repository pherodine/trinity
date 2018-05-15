(function($)
{
	$.fn.textshuffle = function(arg)
	{
		var defaults =
		{
			str : "",
			waitChar : "-",
			charSpeed : 1,
			moveFix : 25,
			moveRange : 10,
			moveTrigger : 25,
			fps : 60
		};



		var options = $.extend(defaults, arg);

		return this.each(function(i)
		{
			var $target;
			// var id = -1;
			var htmlStore;

			var cMin = 33;
			var cMax = 126;

			var description;
			var randomList;
			var textCount;
			var fixLength;
			var fixStr;
			var currentStr;
			var end_charMotion;
			var end_textCount;
			var txtLabel;
			var listener;



			var randomMotion = function()
			{
				currentStr = fixStr;
				end_charMotion = true;

				for (var i = fixLength; i <= textCount; i++)
				{
					if (randomList[i] != 0 && randomList[i] != null)
					{
						end_charMotion = false;
						var temp_listnum = randomList[i];

						if (Math.abs(temp_listnum) <= options.moveTrigger)
						{
							var charcode = Math.min(Math.max(description.charCodeAt(i) + temp_listnum, cMin), cMax);
							currentStr += String.fromCharCode(charcode);
						}
						else
						{
							currentStr += options.waitChar;
						}

						if (temp_listnum > 0)
						{
							randomList[i] -= 1;
						}
						else
						{
							randomList[i] += 1;
						}
					}
					else
					{
						if (fixLength == i - 1)
						{
							fixLength = i;
							fixStr = description.substring(0, fixLength);
						}

						currentStr += description.charAt(i);
					}

					//text()が遅いので生のtextContentを使う
					// $target.text(currentStr);
					$target.get(0).textContent = currentStr;
				}

				if (textCount <= description.length)
				{
					textCount += options.charSpeed;
				}
				else
				{
					end_textCount = true;
				}

				if (end_charMotion && end_textCount)
				{
					// アニメーション終了
					clearInterval($target.data("id"));
					$target.html($target.data("html"));
					$target.data("run", false);
				}
			};



			//initialize

			$target = $(this);

			if (!$target.data("run"))
			{
				$target.data("html", $target.html());
				// 現在の内容を保存
			}
			else
			{
				// 完了していないので保存しない
			}
			$target.data("run", true);

			$target.html(options.str);
			options.str = $target.text();
			$target.html(options.waitChar);

			if(options.str)
			{
				description = options.str;
				randomList = [];

				for (var j = 0; j <= options.str.length - 1; j++)
				{
					var chr = description.charAt(i);

					if (chr != " ")
					{
						randomList[j] = (options.moveFix + Math.round(Math.random () * options.moveRange)) * (Math.round (Math.random ()) - 0.5) * 2;
					}
					else
					{
						randomList[j] = 0;
					}
				}

				textCount = 0;
				fixLength = 0;
				fixStr = "";

				// アニメーション開始
				clearInterval($target.data("id"));
				var id = setInterval(randomMotion, 1000 / options.fps);
				$target.data("id", id);
			}
		});
	};
})(jQuery);