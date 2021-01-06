build: 
	docker build -t formerstudio .
run:
	docker run -d --name formerstudio --rm -p 3000:3000 formerstudio
stop:
	docker stop formerstudio