/*
* Ataraxer's Snake
*
* Implements: RenderingDirector
* File: rendering-director.h
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version 1.1.0 Alpha
*/
/* OpenGL support */
#ifdef WIN32
	#include <gl\gl.h>
	#include <gl\glu.h>
	#include <gl\glut.h>
	#include <gl\glaux.h>
#endif

#ifdef linux
	#include <GL/gl.h>
	#include <GL/glu.h>
	#include <GL/glut.h>
#endif

#ifdef __APPLE__
	#include <OpenGL/gl.h>
	#include <OpenGL/glu.h>
	#include <GL/glut.h>
#endif

/* Other libraries */
#include <stdlib.h>
#include <math.h>

/* Windows and Visual Studio support */
#ifdef WIN32
	#include <windows.h>
	#pragma comment (lib, "glaux.lib")
#endif

#include "rendering-director.h"
#include "gameplay-director.h"
#include "snake.h"

/* Static fields initialization */
int RenderingDirector::rdFrame = 0;
float RenderingDirector::rdAngle = 0.0f;

/* Static constant fields initialization */
const float RenderingDirector::PI = 3.14159265358979323846f;
const char* RenderingDirector::TITLE = "Ataraxer's Snake";

/*
* rdInitialize(int argc, char** argv)
*
* Initialises and prepares OpenGL via GLUT.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void RenderingDirector::rdInitialize(int argc, char** argv)
{
	/* Initialising */
	{
		glutInit(&argc, argv);
		glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA);
		glutInitWindowSize(WIDTH, HEIGHT);
		glutCreateWindow(TITLE);
	}
	/* Function regestration */
	{
		glutDisplayFunc(rdRender);
		glutReshapeFunc(rdWindowResize);
		glutKeyboardFunc(rdKeyPressed);
		glutSpecialFunc(rdSpecialKeyPressed);
		// 1000 stands for 1 second (1000 ms)
		glutTimerFunc(1000/FRAME_RATE, rdFrameControl, 0);
	}
	/* Initialisation */ 
	{
		glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
		glViewport(0, 0, WIDTH, HEIGHT);
		glMatrixMode(GL_PROJECTION);
		glLoadIdentity();
		gluOrtho2D(0, WIDTH, 0, HEIGHT);
		glMatrixMode(GL_MODELVIEW);
		glLoadIdentity();
	}
	/* Options */
	{
		glEnable(GL_TEXTURE_2D);
		glDisable(GL_DEPTH_TEST);
		glShadeModel(GL_SMOOTH);
	}
	/* Start main loop */
	glutMainLoop();
}

/*
* rdRender()
* 
* Renders game scene.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void RenderingDirector::rdRender()
{
	glClear(GL_COLOR_BUFFER_BIT);
	glLoadIdentity();
	/* Render */
	glBegin(GL_QUADS);
		rdRenderSnacks();
		rdRenderSnake(GameplayDirector::gdGetSnake());
	glEnd();
	/* Rendering finished */
	glutSwapBuffers();
}

/*
* rdFrameControl(int arg)
* 
* Controles game's rdFrame flow. Frame variable represents current
* rdFrame number. It's value changes from 0 to 60, and automaticly
* resets to 0 if overflowed.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 05/01/2012
* Version: 1.0
*/
void RenderingDirector::rdFrameControl(int arg) {
	/* Iterators */
	if (rdFrame == 60) {
		rdFrame = 0;
	}
	rdFrame += 1;
	rdAngle += PI/(FRAME_RATE/2);
	/* ========= */
	if (rdFrame % (FRAME_RATE/SNAKE_SPEED) == 0) {
		GameplayDirector::gdProcess();
	}
    glutPostRedisplay();
    glutTimerFunc(1000/FRAME_RATE, rdFrameControl, 0);
}

/*
* rdOnResize(GLsizei W, GLsizei H)
* 
* Changes projection and viewport size if window size changed.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void RenderingDirector::rdWindowResize(GLsizei W, GLsizei H) 
{
	glutReshapeWindow(WIDTH, HEIGHT);
	int left = (glutGet(GLUT_SCREEN_WIDTH) - WIDTH) / 2;
	int top = (glutGet(GLUT_SCREEN_HEIGHT) - HEIGHT) / 2;
	glutPositionWindow(left, top);
}

/*
* rdKeyPressed(unsigned char key, int x, int y)
* 
* Reacts on keyboard events.
* W - turns snake up
* D - turns snake right
* S - turns snake down
* A - turns snake left
* ESC - pauses/unpauses the game
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 06/01/2012
* Version: 1.0
*/
void RenderingDirector::rdKeyPressed(unsigned char pressedKey, int x, int y) 
{
	switch (pressedKey)
	{
		case 'w':
			GameplayDirector::gdKeyPressed(key_up);
			break;
		case 'd':
			GameplayDirector::gdKeyPressed(key_right);
			break;
		case 's':
			GameplayDirector::gdKeyPressed(key_down);
			break;
		case 'a':
			GameplayDirector::gdKeyPressed(key_left);
			break;
		case 27: // stands for ESC
			rdAngle = 0;
			GameplayDirector::gdKeyPressed(key_esc);
			break;
	}
}

/*
* rdSpecialKeyPressed(int key, int x, int y)
* 
* Reacts on keyboard events
* Arrow up    - turns snake up
* Arrow right - turns snake right
* Arrow down  - turns snake down
* Arrow left  - turns snake left
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 05/01/2012
* Version: 1.0
*/
void RenderingDirector::rdSpecialKeyPressed(int pressedKey, int x, int y) 
{
	switch (pressedKey) 
	{
		case GLUT_KEY_UP:      
			GameplayDirector::gdKeyPressed(key_up);
			break;
		case GLUT_KEY_RIGHT:
			GameplayDirector::gdKeyPressed(key_right);
			break;
		case GLUT_KEY_DOWN:
			GameplayDirector::gdKeyPressed(key_down);
			break;
		case GLUT_KEY_LEFT:
			GameplayDirector::gdKeyPressed(key_left);
			break;
	}
}

/*
* rdOpacity(int modifier)
*
* Calculates intensity of food's color. Modifier argument allowes to change
* the speed of intensity change.
*
* Returns: intensity of food's color, based on current "pseudo-angle" (rdAngle).
*
* Author: Anton Karamanov
* Date: 07/01/2012
* Version: 1.0
*/
float RenderingDirector::rdOpacity(float modifier) {
	if (GameplayDirector::gdIsActive()) {
		return (sin(rdAngle * modifier + 3*PI/2) + 1)/2;
	} else {
		return 0.0f;
	}
}

/*
* rdSetColor(int red, int green, int blue, float alpha)
*
* Wrapper around glColor3ub() function, which allows set opacity of the color
* without using OpenGL alpha color component.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 07/01/2012
* Version: 1.0
*/
void RenderingDirector::rdSetColor(int red, int green, int blue, float alpha) {
	GLubyte red_alpha   = (255 - red)   * alpha;
	GLubyte green_alpha = (255 - green) * alpha;
	GLubyte blue_alpha  = (255 - blue)  * alpha;
	glColor3ub(red + red_alpha, green + green_alpha, blue + blue_alpha);
}

void RenderingDirector::rdPickColor(color newColor, float opacity)
{
	switch(newColor)
	{
		case white:
			rdSetColor(255, 255, 255);
			break;
		case black:
			rdSetColor(000, 000, 000, opacity);
			break;
		case red:
			rdSetColor(220, 000, 000, opacity);
			break;
		case dark_red:
			rdSetColor(175, 000, 000, opacity);
			break;
		case green:
			rdSetColor(115, 195, 75, opacity);
			break;
		case dark_green:
			rdSetColor(90, 150, 60, opacity);
			break;
		case blue:
			rdSetColor(40, 115, 220, opacity);
			break;
		case orange:
			rdSetColor(215, 140, 35, opacity);
			break;
	}
}

/*
* rdRenderSnake(Snake inSnake)
* 
* Renders snake, which is being passed as argument inSnake.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 07/01/2012
* Version: 1.0
*/
void RenderingDirector::rdRenderSnake(Snake inSnake)
{
	for (int i = 0; i < inSnake.Size(); i++) {
		int X = inSnake.GetScale(i).X() * SQUARE_SIZE;
		int Y = inSnake.GetScale(i).Y() * SQUARE_SIZE;
		if (i == inSnake.Size() - 1) {
			if (inSnake.HasCrashed()) {
				rdPickColor(dark_red);
			} else {
				rdPickColor(dark_green);
			}
		} else {
			if (inSnake.HasCrashed()) {
				rdPickColor(red);
			} else {
				rdPickColor(green);
			}
		}
		rdDrawSquare(X, Y);
	}
}

/*
* rdRenderSnacks()
* 
* Renders all snacks.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void RenderingDirector::rdRenderSnacks()
{
	for (int i = 0; i < GameplayDirector::gdGetSnacksQuantity(); i++) {
		int X = GameplayDirector::gdGetSnack(i).X() * SQUARE_SIZE;
		int Y = GameplayDirector::gdGetSnack(i).Y() * SQUARE_SIZE;
		rdPickColor(blue, rdOpacity());
		rdDrawSquare(X, Y);
	}
}

/*
* rdDrawSquare(float x, float y, float size)
* 
* Function DrawScale is a wrapper for drawing a square which represents
* food or snake element. Arguments x and y represent initial position
* of bottom-left corner of the square. Square vertex are being drawn 
* counterclockwise starting from bottom-left corner. Argument size
* represents size of the square. Local float delta represents invisible 
* wrapping (margin) around the square. Note that resulting visible
* square's size is being reduced by margin size.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 05/01/2012
* Version: 1.0
*/
void RenderingDirector::rdDrawSquare(float x, float y, float size) {
	float delta = 2.0f;
	glVertex2f(x + delta, y + delta);
	glVertex2f(x + size - delta, y + delta);
	glVertex2f(x + size - delta, y + size - delta);
	glVertex2f(x + delta, y + size - delta);
}
