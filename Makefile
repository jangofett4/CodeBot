NODEJS = nodejs
HEADLESS = setsid

INPUT = *.ts

ifeq ($(OS),Windows_NT)
	NODEJS = node
	HEADLESS = 
endif

all:
	tsc $(INPUT)

run: all
	$(NODEJS) CodeBot.js > CodeBot.log

headless: all
	$(HEADLESS) $(NODEJS) CodeBot.js > CodeBot.log