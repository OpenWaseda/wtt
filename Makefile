
default:
	make js/wttclient.js

clean:
	-rm js/wttclient.js

js/wttclient.js: src/wttclient.ts src/ext.ts Makefile
	tsc --outFile js/wttclient.js src/wttclient.ts src/ext.ts 


