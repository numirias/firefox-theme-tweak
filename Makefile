run:
	web-ext run --firefox /usr/bin/firefox-nightly --firefox-profile dev --source-dir src

.PHONY: build
build:
	web-ext build --overwrite-dest --artifacts-dir build --source-dir src && rename .zip .xpi build/*.zip
