function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className

    return elem
}

function Barrier(reverse = false) {
    this.element = newElement("div", "barrier")

    const edge = newElement("div", "edge")
    const body = newElement("div", "body")
    this.element.appendChild(reverse ? body : edge)
    this.element.appendChild(reverse ? edge : body)

    this.setHeight = height => body.style.height = `${height}px`
}


function PairOfBarriers(height, opening, x) {
    this.element = newElement("div", "pair-of-barriers")

    this.upper = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.lower.element)

    this.generateOpening = () => {
        const upperHeight = Math.random() * (height - opening)
        const lowerHeight = height - opening - upperHeight

        this.upper.setHeight(upperHeight)
        this.lower.setHeight(lowerHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split("px")[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.generateOpening()
    this.setX(x)
}


function Barriers(height, width, opening, interval, notifyPoint) {

    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + interval),
        new PairOfBarriers(height, opening, width + interval * 2),
        new PairOfBarriers(height, opening, width + interval * 3)
    ]

    const displacement = 3

    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + interval * this.pairs.length)
                pair.generateOpening()
            }

            const halfway = width / 2

            const passedHalfway = pair.getX() + displacement >= halfway &&
                pair.getX() < halfway

            if (passedHalfway) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = newElement("img", "bird")
    this.element.src = "imgs/flappybird.png"

    this.getY = () => parseInt(this.element.style.bottom.split("px")[0])

    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}


function Progress() {
    this.element = newElement("span", "progress")

    this.updatePoints = points => this.element.innerHTML = points

    this.updatePoints(0)
}


function areOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left &&
        b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top &&
        b.top + b.height >= a.top

    return horizontal && vertical
}

function overlapping(bird, barriers) {
    let overlapping = false

    barriers.pairs.forEach(barrierPair => {
        if (!overlapping) {
            const upper = barrierPair.upper.element
            const lower = barrierPair.lower.element
            overlapping = areOverlapping(bird.element, upper) || areOverlapping(bird.element, lower)
        }
    })

    return overlapping
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector("[flappy]")
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animate()
            bird.animate()

            if (overlapping(bird, barriers)) {
                clearInterval(timer)
                location.reload()
            }
        }, 20)
    }
}


new FlappyBird().start()