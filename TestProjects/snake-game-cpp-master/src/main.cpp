/*
* Ataraxer's Snake
*
* Recreation on classic "Snake" game. Player takes control of a snake
* which can grow by collecting (eating) pieces of food that appear in
* random place of a screen. Player controls snake movements by changing
* it's direction with w, a, s, d or arrow keys. Snakes automaticly moves 
* forward in current direction. To collect piece of food player have to
* move through it by directing snake's head to the piece. Every eaten piece
* of food increases the length of snake by 1 segment. If snake collides into
* any of it's own segments it's length decreases by 3 segmets. If snake's 
* length is smaller than 7 it's length will only decreas until it equals 4,
* granting that snake's length will always be at least 4 segments. Difficulty
* of game is being represented by quantity of snake's segment moved per second.
* For example difficulty level of 12 means that snake will move by one segment
* 12 times per second.
*
* Module: main
* File: main.cpp
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version: 1.1.0 Alpha
*/
#include <iostream>
#include "gameplay-director.h"
#include "rendering-director.h"

using std::cout;
using std::endl;

// Programm entry point
int main(int argc, char ** argv) {
	cout << "Ataraxer's Snake 1.1.0 Alpha" << endl;
	GameplayDirector::gdStart(argc, argv);
}
